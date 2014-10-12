////////////////////
// Color

function Color() {

    // rgb(rrr,ggg,bbb) ->  #rrggbb
    this.qRgbToHex = function(qRgb) {
        qRgb = qRgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(qRgb[1]) + hex(qRgb[2]) + hex(qRgb[3]);
    }
    // rrr,ggg,bbb ->  #rrggbb
    this.myRgbToHex = function(rgb) {
        return this.qRgbToHex("rgb(" + rgb + ")");
    }
    // #rrggbb ->  rrr,ggg,bbb
    this.hexToMyRgb = function(hex, isSplit) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if(isSplit) {
            return result ? {
                r : parseInt(result[1], 16),
                g : parseInt(result[2], 16),
                b : parseInt(result[3], 16)
            } : null;
        } else {
            return parseInt(result[1], 16) + "," + parseInt(result[2], 16) + "," + parseInt(result[3], 16);
        }
    }

    this.hexToQRgb = function(hex) {
        var myRgb = this.hexToMyRgb(hex);
        return this.myRgbToHex(myRgb);
    }

    this.qRgbToMyRgb = function(qRgb) {
        var hex = this.qRgbToHex(qRgb);
        return this.hexToMyRgb(hex);
    }
}