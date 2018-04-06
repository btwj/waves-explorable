import * as d3 from 'd3';
import * as Utils from 'utils';

let svg = d3.select('body').append('svg').attr('height', 0).attr('width', 0);
let defs = svg.append('defs');

Object.entries(Utils.colors).forEach(([key, value]) => {
	defs.append('marker')
		.attr('id', `arrow-end-${key}`)
		.attr('viewBox', '0 -5 10 10')
		.attr('refX', 8)
		.attr('refY', 0)
		.attr('markerWidth', 4)
		.attr('markerHeight', 4)
		.attr('orient', 'auto')
	.append('path')
		.attr('d', 'M0,-5L10,0L0,5')
		.attr('class', 'arrowHead')
		.attr('fill', value);

	defs.append('marker')
		.attr('id', `arrow-start-${key}`)
		.attr('viewBox', '-10 -5 10 10')
		.attr('refX', -8)
		.attr('refY', 0)
		.attr('markerWidth', 4)
		.attr('markerHeight', 4)
		.attr('orient', 'auto')
	.append('path')
		.attr('d', 'M0,-5L-10,0L0,5')
		.attr('class', 'arrowHead')
		.attr('fill', value);
});