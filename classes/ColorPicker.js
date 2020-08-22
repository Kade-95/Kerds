let JSElements = require('./JSElements');

module.exports = class ColorPicker extends JSElements {

    constructor() {
        super();
    }

    colorType(color = '#ffffff') {
        let type;
        if (color.indexOf('#') == 0 && (color.length - 1) % 3 == 0) {
            type = 'hex';
        }
        else if (color.indexOf('rgba') == 0) {
            let values = this.inBetween(color, 'rgba(', ')');
            if (values != -1 && values.split(',').length == 4) {
                type = 'rgba';
            }
        }
        else if (color.indexOf('rgb') == 0) {
            let values = this.inBetween(color, 'rgb(', ')');
            if (values != -1 && values.split(',').length == 3) {
                type = 'rgb';
            }
        }

        return type
    }

    hexToRGB(hex = '#ffffff') {
        hex = '0x' + hex.replace('#', '');
        let red = (hex >> 16) & 0xFF,
            green = (hex >> 8) & 0xFF,
            blue = hex & 0xFF;

        return `rgb(${red}, ${green}, ${blue})`;
    }

    rgbToHex(color = 'rgb(0, 0, 0)') {
        let start = color.indexOf('(') + 1;
        let end = color.indexOf(')');
        let [r, g, b, a] = color.slice(start, end).split(',');

        let hex = '#';
        hex += ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b)).toString(16).slice(1, 7);

        return hex;
    }

    addOpacity(color = 'rgb(0, 0, 0)', opacity = 0.5) {
        let start = color.indexOf('(') + 1;
        let end = color.indexOf(')');
        let points = color.slice(start, end).split(',');
        points[3] = opacity;

        return `rgba(${points.join(',')})`;
    }

    getOpacity(color = 'rgb(0, 0, 0)') {
        let [r, g, b, a] = this.inBetween(color, '(', ')').split(',');
        return a.trim();
    }

    invertColor(color = '#ffffff') {
        let type = this.colorType(color);
        let invert;
        if (type == 'hex') {
            color = color.replace('#', '');
            invert = '#' + this.invertHex(color);
        }
        else if (type == 'rgb') {
            color = this.rgbToHex(color).replace('#', '');
            invert = this.invertHex(color);
            invert = this.hexToRGB(invert);
        }
        else if (type == 'rgba') {
            let opacity = this.getOpacity(color);
            color = this.rgbToHex(color).replace('#', '');
            invert = this.invertHex(color);
            invert = this.hexToRGB(invert);
            invert = this.addOpacity(invert, opacity);
        }
        return invert;
    }

    invertHex(hex = 'ffffff') {
        return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substr(1).toUpperCase()
    }
}