import SVG from 'svg.js';
import Helper from './Helper';
import { ZOOM, EVENTS } from './config';

const normalizeEvent = (ev) => {
    if(!ev.touches) {
        ev.touches = [{clientX: ev.clientX, clientY: ev.clientY}];
    }

    return ev.touches;
};

class Zoom extends Helper {
    constructor(svg, params) {
        super();

        this.svg = svg;
        this.bounds = params.bounds || ZOOM.BOUNDS;
        this.zoomFactor = params.zoomFactor || ZOOM.FACTOR;
        this.zoomMin = params.zoomMin || this.getZoomMin();
        this.zoomMax = params.zoomMax || ZOOM.MAX;
        this.duration = params.duration || ZOOM.DURATION;

        this.wheelZoom = this.wheelZoom.bind(this);
        this.panStart = this.panStart.bind(this);
        this.panning = this.panning.bind(this);
        this.panStop = this.panStop.bind(this);

        this.init();
    }

    init() {
        this.zoomInProgress = false;
        this.lastTouches = null;
        this.lastP = null;

        this.svg
            .on('wheel.panZoom', this.wheelZoom)
            .on('mousedown.panZoom', this.panStart, this);

        if (process.env.NODE_ENV) {
            console.log('DrawingSVG-Zoom', this);
        }
    }

    getZoomMin() {
        return this.svg.width() / this.getOriginSize().width;
    }

    wheelZoom(ev) {
        ev.preventDefault();

        // touchpads can give ev.deltaY == 0, which skews the lvl calculation
        if(ev.deltaY == 0) return;

        let lvl = this.zoom() - this.zoomFactor * ev.deltaY / Math.abs(ev.deltaY);
        let p = this.svg.point(ev.clientX, ev.clientY);

        if(lvl > this.zoomMax)
            lvl = this.zoomMax;

        if(lvl < this.zoomMin)
            lvl = this.zoomMin;

        this.zoom(lvl, p);
    }

    panStart(ev) {
        // ev.preventDefault();

        this.svg.off('mousedown.panZoom', this.panStart);

        this.lastTouches = normalizeEvent(ev);

        if(this.zoomInProgress) return;

        this.svg.fire('panStart', {event: ev});

        this.lastP = {x: this.lastTouches[0].clientX, y: this.lastTouches[0].clientY };

        SVG.on(document, 'mousemove.panZoom', this.panning, this);
        SVG.on(document, 'mouseup.panZoom', this.panStop, this);
    }

    panStop(ev) {
        ev.preventDefault();

        this.svg.fire('panEnd', {event: ev});

        if (this.bounds) {
            let box = this.svg.viewbox();
            let newbox = this.checkBounds(this.svg.viewbox());

            if (box.x !== newbox.x || box.y !== newbox.y) {
                this.svg.animate(this.duration).viewbox(newbox).after((situation) => {
                    this.svg.fire(EVENTS.END_PAN_STOP_ANIMATE);
                });
            }
        }

        SVG.off(document,'mousemove.panZoom', this.panning);
        SVG.off(document,'mouseup.panZoom', this.panStop);
        this.svg.on('mousedown.panZoom', this.panStart);
    }

    panning(ev) {
        ev.preventDefault();

        let currentTouches = normalizeEvent(ev);

        let currentP = {x: currentTouches[0].clientX, y: currentTouches[0].clientY };
        let p1 = this.svg.point(currentP.x, currentP.y);
        let p2 = this.svg.point(this.lastP.x, this.lastP.y);
        let deltaP = [p2.x - p1.x, p2.y - p1.y];
        let box = new SVG.Box(this.svg.viewbox()).transform(new SVG.Matrix().translate(deltaP[0], deltaP[1]));

        this.svg.viewbox(box);
        this.lastP = currentP;
    }

    zoom(level, point) {
        let style = window.getComputedStyle(this.svg.node);
        let width = parseFloat(style.getPropertyValue('width'));
        let height = parseFloat(style.getPropertyValue('height'));
        let v = this.svg.viewbox();
        let zoomX = width / v.width;
        let zoomY = height / v.height;
        let zoom = Math.min(zoomX, zoomY);

        if(level == null) {
            return zoom;
        }

        let zoomAmount = zoom / level;
        if(zoomAmount === Infinity) zoomAmount = this.zoomMin;

        point = point || new SVG.Point(width / 2 / zoomX + v.x, height / 2 / zoomY + v.y);

        let box = new SVG.Box(v).transform(new SVG.Matrix().scale(zoomAmount, point.x, point.y));

        if (this.bounds) {
            box = this.checkBounds(box);
        }

        if(this.svg.fire('zoom', {box: box, focus: point}).event().defaultPrevented)
            return this;

        return this.svg.viewbox(box);
    }

    checkBounds(box) {
        const originSize = this.getOriginSize();
        const deltaWidth = originSize.width - box.width;
        const deltaHeight = originSize.height - box.height;

        if (box.x < 0) {
            box.x = 0;
        } else if (box.x > deltaWidth) {
            box.x = deltaWidth;
        }

        if (box.y < 0) {
            box.y = 0;
        } else if (box.y > deltaHeight) {
            box.y = deltaHeight;
        }

        return box;
    }
}

export default Zoom;
