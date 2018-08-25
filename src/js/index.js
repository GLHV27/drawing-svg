import SVG from 'svg.js';
import Draw from './Draw';
import Zoom from './Zoom';
import Polygon from './Polygon';
import Helper from './Helper';
import { EVENTS, CLASSES } from './config';

class DrawingSVG extends Helper {
    constructor(elem, params) {
        super();

        this.elem = elem;

        this.image = params.image || null;
        this.width = params.width || '100%';
        this.height = params.height || '100%';
        this.responsive = params.responsive || false;
        this.zoom = params.zoom || {};
        this.polygons = params.polygons || [];
        this.callbacks = {
            onAfterCreatPolygon: null,
            onBeforeRemovePolygon: null,
            onFocusPolygon: null,
            onBlurPolygon: null,
            ...params.callbacks
        };
        this.children = [];

        this.init();
    }

    init() {
        this.svg = SVG(this.elem).size(this.width, this.height).addClass(CLASSES.svg);

        if (this.image) {
            this.image = this.svg.image(this.image).loaded(this.onLoadedImage.bind(this));
        } else {
            this.initSVG();
        }
    }

    initSVG() {
        this.svg.viewbox(0, 0, this.getOriginSize().width, this.getOriginSize().height);
        this.groupPolygons = this.svg.group();
        this.groupCircles = this.svg.group();

        new Draw(this.svg, {
            groupPolygons: this.groupPolygons,
            groupCircles: this.groupCircles
        });

        if (Object.keys(this.zoom).length) {
            new Zoom(this.svg, {
                ...this.zoom,
                image: this.image
            });
        }

        this.polygons.length && this.createPolygons();

        this.svg
            .on(EVENTS.CREATE_POLYGON, this.onCreatePolygon.bind(this))
            .on(EVENTS.REMOVE_POLYGON, this.removePolygon.bind(this));
    }

    onCreatePolygon(event) {
        const data = event.detail;
        this.createPolygon(data);
    }

    onLoadedImage(loader) {
        if (this.responsive) {
            window.addEventListener('resize', () => {
                this.setSize(loader);
            }, false);

            this.setSize(loader);
        } else {
            this.svg.size(loader.width, loader.height);
        }

        this.initSVG();
    }

    setSize(loader) {
        const widthParent = this.elem.getBoundingClientRect().width;

        this.svg
            .size(widthParent, widthParent / loader.ratio);
    }

    createPolygons() {
        this.polygons.map((polygon) => {
            this.createPolygon({
                points: polygon
            });
        });
    }

    createPolygon(data) {
        let polygon = new Polygon(this.svg, {
            plot: data.points,
            index: this.children.length,
            groupPolygons: this.groupPolygons,
            groupCircles: this.groupCircles,
            onAfterCreatPolygon: this.callbacks.onAfterCreatPolygon,
            onBeforeRemovePolygon: this.callbacks.onBeforeRemovePolygon,
            onFocusPolygon: this.callbacks.onFocusPolygon,
            onBlurPolygon: this.callbacks.onBlurPolygon
        });

        this.children.push(polygon);
    }

    removePolygon(event) {
        const index = event.detail.index;

        this.children.splice(index, 1);

        this.svg.fire(EVENTS.START_WAITING);
    }

    destroy() {
        this.svg.remove();
        this.children = [];
        this.svg = null;
        this.image = null;
        this.groupPolygons = null;
        this.groupCircles = null;
    }
};

window.DrawingSVG = DrawingSVG;
export default DrawingSVG;
