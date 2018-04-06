import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-properties');
const svg = section.select('.diagram svg')
	.attr('width', 500)
	.attr('height', 300)
	.append('g');

const padding = 10;
const height = 300 - padding * 2;
const width = 500 - padding * 2;

const x = d3.scaleLinear()
	.domain([0, 1]).range([padding, padding + width]);
const y = d3.scaleLinear()
	.domain([1, -1]).range([padding, padding + height]);

let amplitude = 0.5;
let frequency = 0.0005;
let wavelength = 0.3;

let t = 0;

const start = Date.now();

const samples = d3.range(0, 1, 0.005);

const wave = (x, t) => {
	return amplitude * Math.sin(Math.PI * 2 * (x / wavelength - frequency * t));
}

const line = d3.line()
	.x(d => { return x(d); })
	.y(d => { return y(wave(d, 0)); });

let linePath = svg.append('path').datum(samples)
	.attr('d', line)
	.attr('fill', 'none')
	.attr('stroke', 'black')
	.attr('stroke-width', '2');

let xAxis = svg.append('line')
	.attr('stroke', Utils.colors.grey)
	.attr('stroke-width', '2')
	.attr('stroke-dasharray', '5, 5')
	.attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(1)).attr('y2', y(0));

const amplitudeLineGroup = svg.append('g');
amplitudeLineGroup.attr('opacity', 0);

const frequencyLine = svg.append('line')
	.attr('stroke', Utils.colors.green)
	.attr('stroke-width', 4)
	.attr('x1', x(0.5)).attr('y1', y(-0.8)).attr('x2', x(0.5)).attr('y2', y(0.8))
	.attr('opacity', 0);

const wavelengthLine = svg.append('line')
	.attr('stroke', Utils.colors.orange)
	.attr('stroke-width', 2)
	.attr('marker-start', 'url(#arrow-start-orange)')
	.attr('marker-end', 'url(#arrow-end-orange)')
	.attr('opacity', 0);

const updateWavelengthLine = (line) => {
	line.attr('x1', x(0.5 - wavelength / 2)).attr('y1', y(0))
		.attr('x2', x(0.5 + wavelength / 2)).attr('y2', y(0));
}

updateWavelengthLine(wavelengthLine);

section.selectAll('.amplitude').on('mouseover', _ => {
	amplitudeLineGroup.attr('opacity', 1);
}).on('mouseout', _ => {
	amplitudeLineGroup.attr('opacity', 0);
});

section.selectAll('.frequency').on('mouseover', _ => {
	frequencyLine.attr('opacity', 1);
}).on('mouseout', _ => {
	frequencyLine.attr('opacity', 0);
});

section.selectAll('.wavelength').on('mouseover', _ => {
	wavelengthLine.attr('opacity', 1);
}).on('mouseout', _ => {
	wavelengthLine.attr('opacity', 0);
});

const sliders = ['amplitude', 'wavelength', 'frequency'];

for (let slider of sliders) {
	section.select(`.slider-row.${slider} input`).node().addEventListener('input', e => {
		if (slider === 'amplitude') {
			amplitude = e.target.value;
		} else if (slider === 'wavelength') {
			wavelength = e.target.value;
			updateWavelengthLine(wavelengthLine);
		} else if (slider === 'frequency') {
			frequency = e.target.value / 1000;
		}
		section.select(`.slider-row.${slider} .value`).text(e.target.value);
	});
}

Utils.createTimer(svg.node(), elapsed => {
	line.y(d => { return y(wave(d, elapsed)); });
	linePath.attr('d', line);

	let amplitudePositions = [];
	for (let n = -Math.ceil(2 * frequency * elapsed) - 1; n < Math.ceil(2/wavelength - 2 * frequency * elapsed) + 1; n++) {
		const curX = wavelength * (frequency * elapsed + (n+0.5)/2.0);
		if (curX >= 0 && curX <= 1) {
			amplitudePositions.push([curX, wave(curX, elapsed)]);

			if (Math.abs(curX - 0.5) < 0.01 && wave(curX, elapsed) > 0) {
				frequencyLine.attr('stroke', Utils.colors.white);
			} else if (frequencyLine.attr('stroke') === Utils.colors.white) {
				frequencyLine.transition().duration(200)
					.attr('stroke', Utils.colors.green);
			}
		}
	}

	let amplitudeLines = amplitudeLineGroup.selectAll('line').data(amplitudePositions);

	amplitudeLines
		.enter()
		.append('line')
		.attr('stroke', Utils.colors.blue)
		.attr('stroke-width', '2')
		.attr('marker-end', 'url(#arrow-end-blue)')
		.merge(amplitudeLines)
		.attr('x1', d => { return x(d[0]); }).attr('x2', d => { return x(d[0]); })
		.attr('y1', d => { return y(0); }).attr('y2', d => { return y(d[1]); });

	amplitudeLines.exit().remove();
});