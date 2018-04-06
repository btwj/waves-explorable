import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-examples');
const svg = section.select('svg.light')
	.attr('width', 500)
	.attr('height', 150)
	.append('g');

const padding = 10;
const height = 150 - padding * 2;
const width = 500 - padding * 2;

const x = d3.scaleLinear()
	.domain([0, 1]).range([padding, padding + width]);
const y = d3.scaleLinear()
	.domain([1, -1]).range([padding, padding + height]);

let amplitude = 0.8;
let frequency = 0.0005;
let wavelength = 0.5;

const halfSqrt3 = 0.5 * Math.sqrt(3);
const getDisplacement = (l, angle) => {
	const x = l * Math.cos(angle);
	const y = l * Math.sin(angle);
	return [-x * 0.5 * 0.5, -x * 1.5 + y];
}

const eWave = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t));
}

const bWave = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t)) * 0.4;
}

const samples = d3.range(0, 1, 0.005);
const displacementSamples = d3.range(0, 1, 0.005 * 5);

const eLine = d3.line()
	.x(d => { return x(d); });
const bLine = d3.line();

const xAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(1)).attr('y2', y(0));

const bGroup = svg.append('g');
const eGroup = svg.append('g');

const eLinePath = svg.append('path').datum(samples)
	.attr('fill', 'none')
	.attr('stroke', Utils.colors.yellow)
	.attr('stroke-width', '2');
const bLinePath = svg.append('path').datum(samples)
	.attr('fill', 'none')
	.attr('stroke', Utils.colors.blue)
	.attr('stroke-width', '2');


Utils.createTimer(svg.node(), elapsed => {
	eLine.y(d => { return y(0 + getDisplacement(eWave(d, elapsed), Math.PI / 2)[1]); });
	eLinePath.attr('d', eLine);
	bLine.x(d => { return x(d + getDisplacement(bWave(d, elapsed), 0)[0]); })
		.y(d => { return y(0 + getDisplacement(bWave(d, elapsed), 0)[1]); });
	bLinePath.attr('d', bLine);

	let eLines = eGroup.selectAll('line').data(displacementSamples);
	let bLines = bGroup.selectAll('line').data(displacementSamples);

	bLines.enter()
		.append('line')
			.attr('stroke', Utils.colors.blue)
			.attr('stroke-width', 2)
			.attr('marker-end', 'url(#arrow-end-blue)')
		.merge(bLines)
			.attr('x1', d => { return x(d); }).attr('y1', d => { return y(0); })
			.attr('x2', d => { return x(d + getDisplacement(bWave(d, elapsed), 0)[0]); })
			.attr('y2', d => { return y(0 + getDisplacement(bWave(d, elapsed), 0)[1]); });

	eLines.enter()
		.append('line')
			.attr('stroke', Utils.colors.yellow)
			.attr('stroke-width', 2)
			.attr('marker-end', 'url(#arrow-end-yellow)')
		.merge(eLines)
			.attr('x1', d => { return x(d); }).attr('y1', d => { return y(0); })
			.attr('x2', d => { return x(d + getDisplacement(eWave(d, elapsed), Math.PI / 2)[0]); })
			.attr('y2', d => { return y(0 + getDisplacement(eWave(d, elapsed), Math.PI / 2)[1]); });
});