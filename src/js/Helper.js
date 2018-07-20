import offset from 'dom-helpers/query/offset';
import { CLASSES, DEF_PARAMS, EVENTS, MOUSE_CODE } from './config';

class Helper {
    customClick(elem) {
        let clientClickX, clientClickY;

        elem
            .on('mousedown', (event) => {
                clientClickX = event.clientX;
                clientClickY = event.clientY;
            })
            .on('mouseup', (event) => {
                if (event.button !== MOUSE_CODE.LEFT || clientClickX !== event.clientX || clientClickY !== event.clientY) {
                    return;
                }

                this.svg.fire(EVENTS.CUSTOM_CLICK, { ev: event });
            });
    }

    getCoordinates(event) {
        const viewbox = this.svg.viewbox();
        const drawBox = offset(this.svg.node);
        let x = event.pageX - drawBox.left;
        let y = event.pageY - drawBox.top;

        if (viewbox.zoom) {
            x = x / viewbox.zoom;
            y = y / viewbox.zoom;
        }

        return {
            x: x + viewbox.x,
            y: y + viewbox.y
        };
    }

    getOriginSize() {
        return {
            width: this.svg.bbox().width,
            height: this.svg.bbox().height
        }
    }

    createElem(type, plot = []) {
        let elem = this.svg[type](plot).addClass(CLASSES.polygon);
        elem.addTo(this.groupPolygons);

        return elem;
    }

    createCircle(x, y) {
        const params = DEF_PARAMS.circle;
        let circle = this.svg.circle(params.radius).cx(x).cy(y).addClass(CLASSES.circle);

        circle.addTo(this.groupCircles);

        return circle;
    }

    triggerCallback(callback, ...params) {
        if (callback && typeof callback === 'function') {
            callback(params);
        }
    }
};

export default Helper;
