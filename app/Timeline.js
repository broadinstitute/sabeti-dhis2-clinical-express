import * as d3 from 'd3';

function Timeline(){
	let W, H, M = {t:20,r:30,b:20,l:30};
	let dis = d3.dispatch('disBrush');

	function exports(selection){
		let arr = selection.datum()?selection.datum():[];
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;

		// ** ------- SCALES & AXES ------- **
		let timeExtent = d3.extent(arr, function(d) { return new Date(d.key); })

		let scaleTime = d3.scaleTime()
			.domain([timeExtent[0], timeExtent[1]])
			.range([0, W])
			.clamp(true)
			.nice();

		let scaleVals = d3.scaleLinear()
			.domain([0, d3.max(arr, function(d) { return +d.value })])
			.range([H, 0]);

		let xAxis = d3.axisBottom(scaleTime)
			.tickFormat(d3.timeFormat("%b %e, '%y"));

		let yAxis = d3.axisLeft(scaleVals)
		.ticks(3)
		.tickSize(-W);

		let brush = d3.brushX()
			.extent([[0,0], [W, H]])
			.on("brush", brushed)

		// ** ------- APPEND SVG ------- **
		let svg = selection.selectAll('svg')
			.data([0])

		let svgEnter = svg.enter()
			.append('svg') //ENTER
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b)

		let plotEnter = svgEnter.append('g').attr('class','plot timeline')
			.attr('transform','translate('+M.l+','+M.t+')');


		plotEnter.append('g').attr('class', 'axis axisX').attr('transform', 'translate(' + 0 + ',' + H + ')');
		plotEnter.append('g').attr('class', 'axis axisY');

		svgEnter.select('.axisX').call(xAxis);
		svgEnter.select('.axisY').call(yAxis);


		plotEnter.selectAll('.bars').data(arr).enter().append('rect')
				.attr('class', 'bars')
		    .attr('x', function(d) { return scaleTime(new Date(d.key)); })
		    .attr('y', function(d) { return scaleVals(d.value); })
		    .attr('width', 15)
		    .attr('height', function(d) {return H - scaleVals(d.value); })
		    .style('fill', '#394141');


		let context = plotEnter.append('g').attr('class', 'context').attr('transform', 'translate(' + 0 + ',' + 0 + ')');

		context.append('g')
			.attr('class', 'brush')
			.call(brush)
			.call(brush.move, scaleTime.range())


		function brushed() {
			let selection = d3.event.selection;
			let startDate = scaleTime.invert(selection[0]);
			let endDate = scaleTime.invert(selection[1]);

			dis.call('disBrush', null, {startDate: startDate, endDate: endDate});
			
			if (!d3.event.sourceEvent) {
				setTimeout(function(d) { dis.call('disBrush', null, {startDate: startDate, endDate: endDate}); }, 1000)
				return
			};

			if (d3.event.sourceEvent.type === 'brush') return;
			let d0 = selection.map(scaleTime.invert);
			let d1 = d0.map(d3.timeDay.round);

			if (d1[0] >= d1[1]) {
				d1[0] = d3.timeDay.floor(d0[0]);
				d1[1] = d3.timeDay.offset(d1[0]);
			}
			d3.select(this).call(d3.event.target.move, d1.map(scaleTime));
		}

	};//-->END exports()

	exports.on = function(event, callback){
		dis.on(event, callback);
		return this;
	}

	return exports;
}//-->END Timeline()

export default Timeline;
