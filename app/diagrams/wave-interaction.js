import * as d3 from 'd3';
import * as Utils from '../utils';

const section = d3.select('#wave-interaction');
const svg = section.select('svg.superposition')
	.attr('width', 500)
	.attr('height', 440)
	.append('g');

const padding = 10;
const height = 440 - padding * 4;
const width = 500 - padding * 2;

const x = d3.scaleLinear()
	.domain([0, 1]).range([padding + 20, padding + width]);
const yScales = {};
yScales.waveOne = d3.scaleLinear()
	.domain([1, -1]).range([padding, padding + height / 4]);
yScales.waveTwo = d3.scaleLinear()
	.domain([1, -1]).range([padding * 2 + height / 4, padding * 2 + 2 * height / 4]);
yScales.resultantWave = d3.scaleLinear()
	.domain([2, -2]).range([padding * 3 + 2 * height / 4, height + padding * 3]);

const groups = {};

const velocity = 0.00010;

const waveOne = {
	amplitude: 0.8,
	frequency: 0.0005
};

const waveTwo = {
	amplitude: 0.8,
	frequency: 0.0005
}

const wave = (x, t, properties) => {
	const wavelength = velocity / properties.frequency;
	return properties.amplitude * Math.sin(Math.PI * 2 * (x / wavelength - properties.frequency * t));
}

const samples = d3.range(0, 1, 0.005);
const displacementSamples = d3.range(0, 1, 0.005 * 5);

const lines = {};
const linePaths = {};
const linePathColors = { 'waveOne': 'blue', 'waveTwo': 'orange', 'resultantWave': 'black' };
const waveNames = ['waveOne', 'waveTwo', 'resultantWave'];
const xAxes = {};
const displacementGroups = {};

waveNames.forEach(waveName => {
	groups[waveName] = svg.append('g');
	displacementGroups[waveName] = groups[waveName].append('g');
	lines[waveName] = d3.line()
		.x(d => { return x(d); }).y(0);
	linePaths[waveName] = groups[waveName].append('path').datum(samples)
		.attr('d', lines[waveName])
		.attr('fill', 'none')
		.attr('stroke', Utils.colors[linePathColors[waveName]])
		.attr('stroke-width', '2');
	xAxes[waveName] = groups[waveName].append('line')
		.attr('stroke', Utils.colors.grey)
		.attr('stroke-width', '2')
		.attr('x1', x(0)).attr('y1', yScales[waveName](0)).attr('x2', x(1)).attr('y2', yScales[waveName](0));
});

const sliders = ['amplitude', 'frequency'];
const slidersGroups = ['one', 'two'];

for (let slidersGroup of slidersGroups) {
	let slidersGroupEl = section.select(`.sliders.${slidersGroup}`);
	for (let slider of sliders) {
		slidersGroupEl.select(`.slider-row.${slider} input`).node().addEventListener('input', e => {
			let waveProps = slidersGroup === 'one' ? waveOne : waveTwo;
			if (slider === 'amplitude') waveProps.amplitude = e.target.value;
			else if (slider === 'frequency') waveProps.frequency = e.target.value / 1000;
			slidersGroupEl.select(`.slider-row.${slider} .value`).text(e.target.value);
		});
	}
}

waveNames.forEach(waveName => {
	if (waveName !== 'resultantWave') {
		let displacementItems = displacementGroups[waveName].selectAll('line').data(displacementSamples);
		let displacementItemsEnter = displacementItems.enter()
			.append('line')
				.attr('stroke', Utils.colors[linePathColors[waveName]])
				.attr('stroke-width', 2)
				.attr('stroke-linecap', 'round')
				.attr('x1', d => { return x(d); })
				.attr('x2', d => { return x(d); });
	}
});

Utils.createTimer(svg.node(), elapsed => {
	waveNames.forEach(waveName => {
		if (waveName === 'waveOne')
			lines[waveName].y(d => { return yScales[waveName](wave(d, elapsed, waveOne)); });
		else if (waveName === 'waveTwo')
			lines[waveName].y(d => { return yScales[waveName](wave(d, elapsed, waveTwo)); });
		else 
			lines[waveName].y(d => { return yScales[waveName](wave(d, elapsed, waveOne) + wave(d, elapsed, waveTwo)); });
		linePaths[waveName].attr('d', lines[waveName]);

		if (waveName !== 'resultantWave') {
			const waveProps = waveName === 'waveOne' ? waveOne : waveTwo;
			displacementGroups[waveName].selectAll('line')
				.attr('y1', d => { return yScales[waveName](0); })
				.attr('y2', d => { return yScales[waveName](wave(d, elapsed, waveProps)); });
		} else {
			let displacementItems = displacementGroups[waveName].selectAll('g').data(displacementSamples);
			let displacementItemsEnter = displacementItems.enter().append('g');
			displacementItemsEnter
				.append('line')
					.attr('class', 'waveOne')
					.attr('stroke', Utils.colors[linePathColors['waveOne']])
					.attr('stroke-width', 4)
					.attr('stroke-linecap', 'round')
					.attr('x1', d => { return x(d); }).attr('y1', d => { return yScales[waveName](0); })
					.attr('x2', d => { return x(d); });
			displacementItemsEnter
				.append('line')
					.attr('class', 'waveTwo')
					.attr('stroke', Utils.colors[linePathColors['waveTwo']])
					.attr('stroke-width', 1)
					.attr('stroke-linecap', 'round')
					.attr('x1', d => { return x(d); })
					.attr('x2', d => { return x(d); });
			let displacementItemsMerge = displacementItems.merge(displacementItemsEnter);

			displacementItemsMerge.select('line.waveOne')
				.attr('y2', d => { return yScales[waveName](wave(d, elapsed, waveOne)); });
			
			displacementItemsMerge.select('line.waveTwo')
				.attr('y1', d => { return yScales[waveName](wave(d, elapsed, waveOne)); })
				.attr('y2', d => { return yScales[waveName](wave(d, elapsed, waveOne) + wave(d, elapsed, waveTwo)); });
		}
	});
});