describe("dropCap plugin", function() {
    describe("firstLetterInParagraphAndIndex", function() {
        it("returns the first letter (not a space, nor a part of an HTML tag) from an array of characters", function() {   
        var tab1 = [" ", " ", " ", "D", "o", "r", "t", "e", " ", "2", " ", "i", "p", "s", "u", "m", " ", "d", "o"],
            tab2 = [" ", " ", " ", " ", " ", "<", "s", "p", "a", "n", ">", " ", " ", " ", "<", "a", " ", "h", "r", "e", "f", "=", '"', "#", "a", "d", "r", "e", "s", '"', " ", "t", "i", "t", "l", "e", "=", '"', "t", "y", "t", "u", "l", '"', ">", " ", " ", " ", "I", "o", "r", "t", "e", " ", "3", " ", "i", "p", "s", "u"],
            tab3 =  ["E", "o", "r", "t", "e", " ", "4", " ", "i", "p", "s", "u", "m"];
            tab4 =  [" ", "Ą", "r", "t", "e", " ", "4", " ", "i", "p", "s", "u", "m"];
        expect(firstLetterInParagraphAndIndex(tab1).letter).toMatch("D");
        expect(firstLetterInParagraphAndIndex(tab2).letter).toMatch("I");
        expect(firstLetterInParagraphAndIndex(tab3).letter).toMatch("E");
        expect(firstLetterInParagraphAndIndex(tab4).letter).toMatch("Ą");
      });
    });
    
    describe("pathToPolygon", function() {
        it("changes an SVG path to a polygon", function() {   
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute("d", "M1128 1036q0 -222 -151.5 -341.5t-433.5 -119.5h-172v-575h-170v1462h379q548 0 548 -426zM371 721h153q226 0 327 73t101 234q0 145 -95 216t-296 71h-190v-594z");
        expect(pathToPolygon(path)).toBe("86px 40px, 72px 71px, 32px 82px, 16px 82px, 16px 136px, 0px 136px, 0px 0px, 35px 0px, 86px 40px");
      });
    });
});

