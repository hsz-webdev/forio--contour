describe('default yAxis', function () {
    var $el, el;
    var narwhal;

    if(!String.prototype.contains) {
        String.prototype.contains = function (str) {
            return this.indexOf(str) >= 0;
        };
    }

    beforeEach(function () {
        $el = $('<div>');
        el = $el.get(0);
        jasmine.Clock.useMock();
        narwhal = createNarwhal();
    });

    function createNarwhal(options) {
        options = _.extend({ el: el, chart: { animations: false } }, options);
        narwhal = new Narwhal(options).cartesian();
        return narwhal;
    }

    it('should have outer Tick marks (ticks at the begining and end of the axis line)', function () {
        narwhal.nullVis([0,10,20,30]).render();
        // the actual axis path should start at -6 (the default outerTickSize)
        d3.timer.flush();
        expect($el.find('.y.axis .domain').attr('d')).toContain('M-6');
    });

    it('with smartAxis=true should only show 3 ticks (min, max + max rounded up)', function () {
        narwhal.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');

        expect(ticks.length).toBe(3);
    });

    it('with smartAxis=false should use the options.yAxis.ticks override if present', function () {
        var nw = createNarwhal({ yAxis: {smartAxis: false, ticks: 4 }});
        nw.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');

        expect(ticks.length).toBe(4);
    });

    it('with smartAxis=false should delegate to d3 if options.yAxis.ticks override is not present', function () {
        var nw = createNarwhal({ yAxis: {smartAxis: false, ticks: null }});
        nw.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');

        // with the given values, d3 would do ticks every 5 so we would get 7 ticks: 0,5,10, 15, 20, 25, 30
        expect(ticks.length).toBe(7);
    });

    it('should align the middle of the label to the tick by default', function () {
        narwhal.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');
        expect(_.all(ticks, function (t) { return $(t).attr('dy').contains('.35em'); })).toBe(true);
    });

    it('should align the middle of the label to the tick when set middle in options', function () {
        narwhal = createNarwhal({yAxis: { labels: { align: 'middle' }}});
        narwhal.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');
        expect(_.all(ticks, function (t) { return $(t).attr('dy').contains('.35em'); })).toBe(true);
    });

    it('should align the top of the label to the tick when set top in options', function () {
        narwhal = createNarwhal({yAxis: { labels: { align: 'top' }}});
        narwhal.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');
        expect(_.all(ticks, function (t) { return $(t).attr('dy').contains('.8em'); })).toBe(true);
    });

    it('should align the bottom of the label to the tick when set bottom in options', function () {
        narwhal = createNarwhal({yAxis: { labels: { align: 'bottom' }}});
        narwhal.nullVis([0,10,20,30]).render();
        d3.timer.flush();
        var ticks = $el.find('.y.axis .tick text');
        expect(_.all(ticks, function (t) { return $(t).attr('dy') === '0'; })).toBe(true);
    });

    describe('with smart y axis', function () {
        it('should round the max tick value to a nice value', function () {
            narwhal.nullVis([1,2,3,4]).render();

            d3.timer.flush();
            var lastTicks = $el.find('.y.axis .tick text').last();

            expect(lastTicks.text()).toBe('5');
        });

        describe('calling setYDomain', function () {
            it('should recalculate yAxis and ticks with new domain', function () {
                nw = createNarwhal({}).nullVis([{data: [1,2,3,4]}, {data: [5,6,2,4]}]).render();

                nw.setData([1,2,3,50]).render();
                var ticks = $el.find('.y.axis .tick text');
                expect(+ticks.last().text()).toBe(55);
            });
        });

        describe('with label formatter function set', function () {
            it('should use the function to format tick labels', function () {
                var text = 'format';
                narwhal = createNarwhal({yAxis:  { smartAxis: true, labels: {
                    formatter: function () { return text; }
                }}});

                narwhal.nullVis([1,2,3]).render();
                expect($el.find('.y.axis .tick text').eq(0).text()).toBe(text);
                expect($el.find('.y.axis .tick text').eq(1).text()).toBe(text);
                expect($el.find('.y.axis .tick text').eq(2).text()).toBe(text);
            });
        });
    });

    describe('without smartYAxis', function () {

    });


    describe('with options.yAxis.max set', function () {
        beforeEach(function () {
            narwhal = createNarwhal({ yAxis: { max: 100, min: null }});
        });

        it('should use the options.yAxis.max as the max of the domain', function () {
            narwhal.nullVis([0,10,20,30]).render();
            // a value equal to the max should be scaled at the top of the chart (y=0)
            expect(narwhal.yScale(100)).toBe(0);
        });

        it('should merge options.yAxis.min as the last tick', function () {
            narwhal.nullVis([0,10,20,30]).render();
            var topTick = $el.find('.y.axis .tick').last();
            expect(topTick.find('text').text()).toBe('100');
            expect(topTick.attr('transform')).toBe('translate(0,0)');
        });

        xit('should handle the case where max is less than the data set\'s min', function () {
            narwhal.nullVis([200, 300, 400]).render();
            var ticks = $el.find('.y.axis .tick');

            expect(ticks.length).toBe(1);
        });
    });


    describe('with options.yAxis.min set', function () {
        beforeEach(function () {
            narwhal = createNarwhal({ yAxis: { min: 3 }});
        });

        it('should merge options.yAxis.min as the first tick', function () {
            narwhal.nullVis([10,20,30]).render();
            var topTick = $el.find('.y.axis .tick').first();
            expect(topTick.find('text').text()).toBe('3');
            expect(topTick.attr('transform')).toBe('translate(0,' + narwhal.options.chart.plotHeight + ')');
        });

        it('should not show data min as a tick', function () {
            // we should end with ticks at min, yMax and niceRoundMax
            narwhal.nullVis([10,20,30]).render();
            var ticks = $el.find('.y.axis .tick text');
            expect(ticks.eq(0).text()).toBe('3');
            expect(ticks.eq(1).text()).toBe('30');
            expect(ticks.eq(2).text()).toBe('33'); // data yMax is 30 so nice round will give us 10% more
        });

        it('should use it as the abs min of the domain', function () {
            narwhal.nullVis([10,20,30]).render();
            // a value equals to the min should be at the bottom of the chart
            // so it should be equal plotHeight (y grows down)
            expect(narwhal.yScale(3)).toBe(narwhal.options.chart.plotHeight);
        });

        it('should handle the case where min is greater than the data set\'s max', function () {
            narwhal.nullVis([1,2,3]).render();
            var ticks = $el.find('.y.axis .tick');

            expect(ticks.length).toBe(1);
        });
    });

    describe('with both min and max set', function () {
        beforeEach(function () {
            narwhal = createNarwhal({yAxis: { min: -2, max: 500 }});
        });

        it('should set the domain to be [min, max]', function () {
            narwhal.nullVis([1,2,3]).render();

            expect(narwhal.yScale(500)).toBe(0);
            expect(narwhal.yScale(-2)).toBe(narwhal.options.chart.plotHeight);
        });
    });

    describe('with label formatter function set', function () {
        it('should use the function to format tick labels', function () {
            var text = 'format';
            // this function should get called once per label
            var formatter = function (label, index, fullCollection) { return text; };
            narwhal = createNarwhal({yAxis:  { smartAxis: false, labels: { formatter: formatter }}});

            narwhal.nullVis([1,2,3]).render();
            expect($el.find('.y.axis .tick text').eq(0).text()).toBe(text);
            expect($el.find('.y.axis .tick text').eq(1).text()).toBe(text);
            expect($el.find('.y.axis .tick text').eq(2).text()).toBe(text);
        });
    });

});

