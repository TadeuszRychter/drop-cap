//function dropCap(settings) {
    "use strict";
	var settings = {			
			fontURL: 'http://plugin.solidprojekt.eu/OpenSans-Regular-webfont.svg',
			paragraphClass: 'drop-cap-paragraph',
			elementID: null, // leave null to use plugin on classes
			elementWithShapeOutsideClass: 'drop-cap-element',
			elementWithShapeOutsideStyle:   'shape-margin: 1em;'+
                                            'float: left;', // width and height are based on the biggest polygon's size and attached later
			wrapperClass: 'drop-cap-wrapper',
			wrapperStyle:   'margin: 50px auto;'+
                            'width: 700px;'+
                            'overflow: hidden;'+// overflow: hidden and position: relative are necessary for proper work
                            'position: relative;', // overflow: hidden and position: relative are necessary for proper work
			firstLetterSpanClass: 'drop-cap-letter',
			firstLetterSpanStyle:   'position: absolute;'+
                                    'left: -12px;'+ // set left and top values to compensate for glyph vs font size and gain alignment
                                    'top: -30px;'+
                                    'font-family: "Open Sans";', 
			firstLetterFontSize: 194, //without unit
			firstLetterFontSizeUnit: 'px',
			letterHeightToFontSizeRatio: 0.7
		};
        
    var numberOfLettersToChange,
        firstLetters = [],
        polygons = [],
        dropCapParagraphs = [],
        glyphs,
        elementWithShapeOutsideWidth = 0,
        elementWithShapeOutsideHeight = 0;

    // if there's no elementID set in the settings then operate on paragraphs with a given class
    if (settings.elementID === null) {
        dropCapParagraphs = document.getElementsByClassName(settings.paragraphClass);
        numberOfLettersToChange = dropCapParagraphs.length;
    } else {
        numberOfLettersToChange = 1;
        dropCapParagraphs[0] = document.getElementById(settings.elementID);
    }

    // return the biggest value in an array
    function arrayMax(array) {
        return Math.max.apply(Math, array);
    }

    // return the smallest value in an array
    function arrayMin(array) {
        return Math.min.apply(Math, array);
    }

    // return all glyphs from an SVG font
    function getGlyphs(fontURL) {
        var xmlhttp, fontSVG;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', fontURL, false);
        xmlhttp.send();
        fontSVG = xmlhttp.responseXML;
        return fontSVG.getElementsByTagName("glyph");
    }

    // provide necessary containers to use CSS shape-outside 
    function wrapElements(numberOfElements, elementToWrap, wrapperClass, elementWithShapeOutsideClass) {
        var parent,
            child,
            wrapper,
            elementShapeOutside,
            i;
        for (i = 0; i < numberOfElements; i += 1) {
            parent = elementToWrap[i].parentNode;
            child = elementToWrap[i]; // it's not an excess variable, it's necessary for proper processing
            wrapper = document.createElement('div');
            wrapper.className = wrapperClass;
            elementShapeOutside = document.createElement('div');
            elementShapeOutside.className = elementWithShapeOutsideClass;
            parent.replaceChild(wrapper, child);
            wrapper.appendChild(child);
            wrapper.insertBefore(elementShapeOutside, child);
        }
    }

    // return the first letter and its index from an array of characters (coming from a paragraph)
    // taking into account possible spaces and HTML tags
    function firstLetterInParagraphAndIndex(tab) {
        var limit,
            i,
            j,
            k;
        if (tab[0] !== '<' && tab[0] !== ' ') {
            return {
                letter: tab[0],
                index: 0
            };
        }
        limit = tab.length;
        for (i = 1; i < limit; i += 1) {
            if (tab[i] === '>' && tab[i + 1] !== '<' && tab[i + 1] !== ' ') {
                return {
                    letter: tab[i + 1],
                    index: i + 1
                };
            }
            if (tab[i] === '>' && tab[i + 1] !== '<' && tab[i + 1] === ' ') {
                j = i;
                for (j; j < limit; j += 1) {
                    if (tab[j + 2] !== ' ') {
                        if (tab[j + 2] === '<') {
                            break;
                        }
                        return {
                            letter: tab[j + 2],
                            index: j + 2
                        };
                    }
                }
            } else if (tab[0] === ' ') {
                for (k = 1; k < limit; k += 1) {
                    if (tab[k] !== ' ') {
                        if (tab[k] === '<') {
                            break;
                        }
                        return {
                            letter: tab[k],
                            index: k
                        };
                    }
                }
            }
        }
    }

    // put every first letter from specified paragraphs into a span of a given class and return an array of all the first letters
    function findWrapAndReturnFirstLetters(numberOfLettersToChange, element, firstLetterSpanClass) {
        var firstLettersArray = [],
            letters,
            index,
            firstLetter,
            i;
        for (i = 0; i < numberOfLettersToChange; i += 1) {
            letters = element[i].innerHTML.split('', 1023);
            index = firstLetterInParagraphAndIndex(letters).index;
            firstLetter = firstLetterInParagraphAndIndex(letters).letter;
            element[i].innerHTML = element[i].innerHTML.substring(0, index) + '<span class="' + firstLetterSpanClass + '">' + firstLetter + '</span>' + element[i].innerHTML.substring(index + 1);
            firstLettersArray[i] = firstLetter;
        }
        return firstLettersArray;
    }

    // transform with necessary adjustments a path of a glyph (SVG path) to a polygon (CSS polygon)
    // this function is based on the code from Path to Polygon Converter http://betravis.github.io/shape-tools/path-to-polygon/
    // the author of which is Bear Travis and the license is a creative commons license http://creativecommons.org/licenses/by/3.0/
    function pathToPolygon(letterPath) {
        function pathToPoints(segments, firstLetterFontSize, letterHeightToFontSizeRatio) {
            var count = segments.numberOfItems,
                result = [],
                segment,
                x,
                y,
                j,
                i,
                xPoints = [],
                yPoints = [],
                letterDefaultHeight,
                ratio,
                numberOfPoints,
                maxY,
                minY,
                minX,
                maxX;
            for (j = 0; j < count; j += 1) {
                segment = segments.getItem(j);
                switch (segment.pathSegType) {
                case SVGPathSeg.PATHSEG_MOVETO_ABS:
                case SVGPathSeg.PATHSEG_LINETO_ABS:
                case SVGPathSeg.PATHSEG_CURVETO_CUBIC_ABS:
                case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_ABS:
                case SVGPathSeg.PATHSEG_ARC_ABS:
                case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_ABS:
                case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS:
                    x = segment.x;
                    y = segment.y;
                    break;
                case SVGPathSeg.PATHSEG_MOVETO_REL:
                case SVGPathSeg.PATHSEG_LINETO_REL:
                case SVGPathSeg.PATHSEG_CURVETO_CUBIC_REL:
                case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_REL:
                case SVGPathSeg.PATHSEG_ARC_REL:
                case SVGPathSeg.PATHSEG_CURVETO_CUBIC_SMOOTH_REL:
                case SVGPathSeg.PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL:
                    x = segment.x;
                    y = segment.y;
                    if (result.length > 0) {
                        x += result[result.length - 2];
                        y += result[result.length - 1];
                    }
                    break;
                case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_ABS:
                    x = segment.x;
                    y = result[result.length - 1];
                    break;
                case SVGPathSeg.PATHSEG_LINETO_HORIZONTAL_REL:
                    x = result[result.length - 2] + segment.x;
                    y = result[result.length - 1];
                    break;
                case SVGPathSeg.PATHSEG_LINETO_VERTICAL_ABS:
                    x = result[result.length - 2];
                    y = segment.y;
                    break;
                case SVGPathSeg.PATHSEG_LINETO_VERTICAL_REL:
                    x = result[result.length - 2];
                    y = segment.y + result[result.length - 1];
                    break;
                case SVGPathSeg.PATHSEG_CLOSEPATH:
                    numberOfPoints = result.length;
                    for (i = 0; i < numberOfPoints; i += 2) {
                        xPoints.push(result[i]);
                        yPoints.push(result[i + 1]);
                    }
                    maxY = arrayMax(yPoints);
                    minY = arrayMin(yPoints);
                    minX = arrayMin(xPoints);
                    for (i = 0; i < numberOfPoints; i += 2) {
                        result[i] = result[i] - minX;
                        result[i + 1] = maxY - result[i + 1];
                    }
                    letterDefaultHeight = maxY - minY;
                    ratio = firstLetterFontSize / letterDefaultHeight;
                    for (i = 0; i < numberOfPoints; i += 1) {
                        result[i] = result[i] * ratio * letterHeightToFontSizeRatio;
                    }
                    xPoints = [];
                    yPoints = [];
                    for (i = 0; i < numberOfPoints; i += 2) {
                        xPoints.push(result[i]);
                        yPoints.push(result[i + 1]);
                    }
                    maxY = arrayMax(yPoints);
                    maxX = arrayMax(xPoints);
                    if (maxX > elementWithShapeOutsideWidth) {
                        elementWithShapeOutsideWidth = maxX.toFixed(0);
                    }
                    if (maxY > elementWithShapeOutsideHeight) {
                        elementWithShapeOutsideHeight = maxY.toFixed(0);
                    }
                    return result;
                default:
                    console.log('unknown path command: ', segment.pathSegTypeAsLetter);
                }
                result.push(x, y);
            }
        }

        function pointCommandsToCSSPoints(pointCommands, firstLetterFontSizeUnit) {
            return pointCommands.map(function (value, index, array) {
                return value.toFixed(0) + firstLetterFontSizeUnit + ((index % 2 === 1 && index < array.length - 1) ? ',' : '');
            }).join(' ');
        }
        var cssPolygons = [],
            points;
        points = pathToPoints(letterPath.pathSegList, settings.firstLetterFontSize, settings.letterHeightToFontSizeRatio);
        cssPolygons.push(pointCommandsToCSSPoints(points, settings.firstLetterFontSizeUnit));
        return cssPolygons.join('');
    }

    // return an array of letters-polygons created out of SVG glyphs
    function getPolygonsForFirstLetters(numberOfLettersToChange, glyphs) {
        var polygonsArray = [],
            i,
            j,
            letter,
            letterSVGpath;
        for (i = 0; i < numberOfLettersToChange; i += 1) {
            for (j = 0; j < glyphs.length; j += 1) {
                if (glyphs[j].getAttribute('unicode') === firstLetters[i]) {
                    letter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    letterSVGpath = glyphs[j].getAttribute('d');
                    letter.setAttribute("d", letterSVGpath);
                    polygonsArray[i] = letter;
                }
            }
            polygonsArray[i] = pathToPolygon(polygonsArray[i]);
        }
        return polygonsArray;
    }

    // set an inline CSS style to an element
    function setStyle(element, text) {
        element.setAttribute("style", text);
        element.style.cssText = text;
    }

    glyphs = getGlyphs(settings.fontURL);
    wrapElements(numberOfLettersToChange, dropCapParagraphs, settings.wrapperClass, settings.elementWithShapeOutsideClass);
    firstLetters = findWrapAndReturnFirstLetters(numberOfLettersToChange, dropCapParagraphs, settings.firstLetterSpanClass);
    polygons = getPolygonsForFirstLetters(numberOfLettersToChange, glyphs);

    // add styles to each first letter
    (function () {
        var i;
        for (i = 0; i < numberOfLettersToChange; i += 1) {
            setStyle(document.getElementsByClassName(settings.elementWithShapeOutsideClass)[i], 
            'width: ' + (elementWithShapeOutsideWidth * 1.15).toFixed(0) + 'px;' + // coefficient of 1.15 comes from sizes of rendered glyphs being bigger than polygons
            'height: ' + (elementWithShapeOutsideHeight * 1.15).toFixed(0) + 'px;' + 
            'shape-outside: polygon(' + polygons[i] + ');' + settings.elementWithShapeOutsideStyle);
            setStyle(document.getElementsByClassName(settings.wrapperClass)[i], settings.wrapperStyle);
            setStyle(document.getElementsByClassName(settings.firstLetterSpanClass)[i], settings.firstLetterSpanStyle +
            'font-size:' + settings.firstLetterFontSize + settings.firstLetterFontSizeUnit + ';' +
            'line-height:' + settings.firstLetterFontSize + settings.firstLetterFontSizeUnit + ';');
        }
    }());
//}