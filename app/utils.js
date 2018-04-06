import * as d3 from 'd3';

export const colors = {
	blue: '#3867d6',
	green: '#20bf6b',
	orange: '#fa8231',
	yellow: '#f7b731',
	red: '#eb3b5a',
	white: '#fff',
	black: '#000',
	grey: '#aaa'
};

export const elementInViewport = el => {
	const rect = el.getBoundingClientRect();
	const height = window.innerHeight || document.documentElement.clientHeight;
	return (
		(rect.top >= 30 && rect.top <= height - 30) ||
		(rect.bottom >= 30 && rect.bottom <= height - 30)
	);
}

let timers = [];

export const createTimer = (el, callback) => {
	timers.push({
		el,
		callback,
		visible: false,
		timer: d3.timer(callback)
	});
}

const updateTimers = _ => {
	for (let timer of timers) {
		if (elementInViewport(timer.el) != timer.visible) {
			timer.visible = elementInViewport(timer.el);
			if (timer.visible) {
				timer.timer.restart(timer.callback);
			} else {
				timer.timer.stop();
			}
		}
	}
}

['DOMContentLoaded', 'load', 'scroll', 'resize'].forEach(event => {
	window.addEventListener(event, updateTimers, false);
});

export const createSlider = (sliderRow, callback, valueCallback) => {
	if (valueCallback === undefined) valueCallback = (value, el) => { return el.text(value); };
	sliderRow.select('input').node().addEventListener('input', e => {
		callback(e.target.value);
		valueCallback(e.target.value, sliderRow.select('.value'));
	})
}