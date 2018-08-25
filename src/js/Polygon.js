import Helper from './Helper';
import { EVENTS, CLASSES, KEY_CODE } from './config';

class Polygon extends Helper {
    constructor(svg, params) {
        super();

        this.svg = svg;
        this.index = params.index;
        this.elem = null;
        this.plot = params.plot;
        this.groupPolygons = params.groupPolygons;
        this.groupCircles = params.groupCircles;
        this.onAfterCreatPolygon = params.onAfterCreatPolygon;
        this.onBeforeRemovePolygon = params.onBeforeRemovePolygon;
        this.onFocusPolygon = params.onFocusPolygon;
        this.onBlurPolygon = params.onBlurPolygon;
        this.points = [];

        this.init();
    }

    init() {
        this.elem = this.createElem('polygon', this.plot);
        this.plot = this.elem.array().value;

        this.createPoints();

        this.elem
            .on('focus.Polygon', this.onFocus.bind(this))
            .on('blur.Polygon', this.onBlur.bind(this));

        this.triggerCallback(this.onAfterCreatPolygon, this.plot);
    }

    onFocus() {
        this.elem
            .addClass(CLASSES.polygonFocus)
            .on('keyup.Polygon', this.onKeyup.bind(this));

        this.triggerCallback(this.onFocusPolygon, this.index);
    }

    onBlur() {
        this.elem
            .removeClass(CLASSES.polygonFocus)
            .off('keyup.Polygon');

        this.triggerCallback(this.onBlurPolygon, this.index);
    }

    onKeyup(event) {
        if (KEY_CODE.DELETE === event.keyCode) {
            this.remove();
        }
    }

    remove() {
        this.triggerCallback(this.onBeforeRemovePolygon, this.index);

        this.removePoints();
        this.elem.remove();

        this.svg.fire(EVENTS.REMOVE_POLYGON, { index: this.index });
    }

    createPoints() {
        this.plot.map((item) => {
            let circle = this.createCircle(item[0], item[1]);
            this.points.push(circle);
        });
    }

    removePoints() {
        this.points.map((point) => {
            point.remove();
        });
    }
};

export default Polygon;
