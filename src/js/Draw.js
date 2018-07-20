import Helper from './Helper';
import { MOUSE_CODE, EVENTS, CLASSES } from './config';

const START_WAITING = 'startWaiting';

class Draw extends Helper {
    constructor(svg, params) {
        super();

        this.svg = svg;
        this.elem = null;
        this.points = [];
        this.groupPolygons = params.groupPolygons;
        this.groupCircles = params.groupCircles;

        this.init();
    }

    init() {
        this.customClick(this.svg);

        this.svg.on(START_WAITING, () => {
            this.svg.on(EVENTS.CUSTOM_CLICK, this.start.bind(this));
        }).fire(START_WAITING)
        .on('contextmenu.Draw', (event) => event.preventDefault());
    }

    start(event) {
        event = event.detail.ev;

        if (this.svg.node !== event.target && event.target.tagName !== 'circle' && event.target.tagName !== 'image') {
            return;
        }

        this.disabled();

        this.elem = this.createElem('polyline').addClass(CLASSES.polygonDrawing);

        if (event.target.tagName === 'circle') {
            this.onClickCircle(event);
        } else {
            this.createPoint(event);
        }

        this.updateClassesCircle();

        this.svg
            .off(EVENTS.CUSTOM_CLICK)
            .on('mousemove.Draw', this.onMouseMoveSVG.bind(this))
            .on('mouseup.Draw', this.onClickSVG.bind(this))
            .on(EVENTS.END_PAN_STOP_ANIMATE, this.endPanStopAnimate.bind(this))
            .on(EVENTS.CUSTOM_CLICK, this.onClickLeftMouseButton.bind(this));
    }

    stopDrawing() {
        const points = this.getPlot();

        this.offEventsDraw();
        this.disabled(false);
        this.remove();
        this.curEventMouse = null;

        this.svg.fire(EVENTS.CREATE_POLYGON, { points });
    }

    offEventsDraw() {
        this.svg.off('mouseup.Draw').off('mousemove.Draw').off(EVENTS.CUSTOM_CLICK).off(EVENTS.END_PAN_STOP_ANIMATE);
    }

    onClickSVG(event) {
        if (event.button === MOUSE_CODE.RIGHT) {
            this.onClickRightMouseButton(event);
        }
    }

    onClickLeftMouseButton(event) {
        event = event.detail.ev;

        if (event.target.tagName == 'circle') {
            let isCircle = this.isCircle(event.target);

            if (isCircle && event.target !== this.points[0].node || this.points.length === 1 && isCircle) {
                return false;
            } else if (event.target === this.points[0].node && this.points.length > 1) {
                this.stopDrawing();
                return false;
            } else {
                this.onClickCircle(event);
                return false;
            }
        }

        this.createPoint(event);
    }

    onClickRightMouseButton() {
        this.removeLastPoint();
    }

    onClickCircle(event) {
        this.createPoint(event.target.instance);
        this.updatePlot();
    }

    onMouseMoveSVG(event) {
        this.curEventMouse = event;

        this.updatePlot();
    }

    updatePlot() {
        let plot = this.getPlot();

        if (this.curEventMouse) {
            const point = this.getCoordinates(this.curEventMouse);
            plot.push([point.x, point.y]);
        }

        this.elem.plot(plot);
    };

    updateClassesCircle() {
        this.points.map((circle, i) => {
          circle.removeClass(CLASSES.circleLast);

          if (i === 0) {
              circle.addClass(CLASSES.circleFirst);
          } else if (i === this.points.length - 1) {
              circle.addClass(CLASSES.circleLast);
          }
        });
    }

    getPlot() {
        let points = [];

        this.points.map((point) => {
            points.push([point.cx(), point.cy()]);
        });

        return points;
    }

    isCircle(target) {
        return !!this.points.find((point) => target === point.node);
    }

    removeLastPoint() {
        let circle = this.points[this.points.length - 1];

        circle.remove();

        this.points.pop();

        if (!this.points.length) {
          this.points = [];
          this.offEventsDraw();
          this.disabled(false);
          this.elem.remove();
          this.svg.fire(START_WAITING);
        } else {
          this.updatePlot();
          this.updateClassesCircle();
        }
    }

    remove() {
      const count = this.points.length;

      for (let i = 0; i < count; i++) {
        this.removeLastPoint();
      }

      this.elem.remove();
    }

    createPoint(item) {
        let point = null;

        if (item.target) {
            point = this.getCoordinates(item);
        } else {
            point = {
                x: item.cx(),
                y: item.cy()
            };
        }

        let circle = this.createCircle(point.x, point.y);
        this.points.push(circle);

        this.updateClassesCircle();
    }

    disabled(disabled = true) {
        this.groupPolygons.children().map((polygon) => {
            if (disabled) {
                polygon.addClass(CLASSES.polygonDisabled);
            } else {
                polygon.removeClass(CLASSES.polygonDisabled);
            }
        });
    }

    endPanStopAnimate() {
        this.updatePlot();
    }
}

export default Draw;
