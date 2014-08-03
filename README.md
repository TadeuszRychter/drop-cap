drop-cap
========

a vanilla JavaScript plugin which makes use of CSS shape-outside and SVG fonts

#What is this?
Inspired by [Sara Soueidan’s article on A List Apart]( http://alistapart.com/article/css-shapes-101) I wanted to achieve the effect of text flowing around the shape of its first letter – a peculiar [drop cap](http://en.wikipedia.org/wiki/Drop_cap). In order to do it I use some JavaScript, an SVG font and transform glyphs of specific letters to polygons. Since it uses SVG fonts it's also possible to flow texts around arbitrary shapes from icon fonts. Beware of the limitation described below.

[![drop cap](http://plugin.solidprojekt.eu/release/drop-cap.png "screenshot of drop cap in use")](http://plugin.solidprojekt.eu/release/drop-cap.png)

#Demo
To [see it live and working](http://plugin.solidprojekt.eu/release/index.html) you need to [enable support for shape-outside in your browser](http://html.adobe.com/webplatform/enable/#section-chrome). As shown in the picture above you can see the actual polygon when you look closer with Chrome inspection tools.

#Usage
This plugin can be used on any paragraph or paragraphs specified by a class or an ID. Just open the index.html and see the examples. I hope the comments inside provide exhaustive clarifications. Be ready for manually tweaking some sizes in the settings depending on used fonts. They vary a lot. 

#Known limitation
The function responsible for converting SVG paths to polygons doesn't work well with glyphs consisting of separate shapes. E.g. when used against the letter "i" it'll only find and process the dot. Since drop caps are capital letters it shouldn't really matter. However problems may occur with some icons.

#License and acknowledgement
As marked in the source code the function pathToPolygon is based on the code from the [Path to Polygon Converter](http://betravis.github.io/shape-tools/path-to-polygon/) authored by Bear Travis licensed on a [creative commons license] (http://creativecommons.org/licenses/by/3.0/). Everything else has a double license MIT/CC from the previous sentence.

#Tests
There's folder "tests" with Jasmine and a tiny test spec. However it doesn't mean that this plugin was developed using TDD approach. It's actually for a function I've written to find first letter instead of using a simple regexp like others. This way I support non-latin characters. And blasphemously test implementation ;). To avoid closure and possible workarounds I test the plugin with first and last lines commented out and settings pasted in.
