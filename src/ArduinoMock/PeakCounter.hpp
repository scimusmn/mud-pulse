#pragma once

#include <string.h>


template <size_t windowSize>
class Average {
	protected:
	double window[windowSize];
	int index;
	double windowTotal;

	public:
	Average() : index(0), windowTotal(0) {
		reset();
	}

	void reset() {
		// zero window
		memset(window, 0, windowSize * sizeof(double));
		index = 0;
		windowTotal = 0;
	}

	void push(double value) {
		windowTotal -= window[index];
		windowTotal += value;
		window[index] = value;
		index = (index+1) % windowSize;
	}

	double value() {
		return windowTotal / windowSize;
	}
};


class MinimumThreshold {
	protected:
	double minimum;
	double v;

	public:
	MinimumThreshold(double minimum) : minimum(minimum) {}

	void push(double value) {
		v = value < minimum ? 0 : value;
	}

	double value() {
		return v;
	}
};


class MaximumThreshold {
	protected:
	double maximum;
	double v;

	public:
	MaximumThreshold(double maximum) : maximum(maximum) {}

	void push(double value) {
		v = value > maximum ? maximum : value;
	}

	double value() {
		return v;
	}
};


class Derivative {
	protected:
	double step, prev, curr;

	public:
	Derivative(double stepSize = 1) : step(stepSize), prev(0), curr(0) {}

	void reset() {
		prev = 0;
		curr = 0;
	}

	void push(double value) {
		prev = curr;
		curr = value;
	}

	double value() {
		return (curr - prev) / step;
	}
};


template <size_t windowSize>
class PeakCounter {
	public:
	int peaks;
	double prevDeriv;
	Average<windowSize> avg;
	MinimumThreshold threshold;
	MaximumThreshold maximum;
	Derivative derivative;

	public:
	PeakCounter(double min, double max, double step=1) : 
		peaks(0), prevDeriv(0), 
		avg(), threshold(min), maximum(max), derivative(step) {}
	
	void reset() {
		avg.reset();
		derivative.reset();
		peaks = 0;
		prevDeriv = 0;
	}

	void push(double value) {
		avg.push(value);
		Serial.println(avg.value());
		threshold.push(avg.value());
		Serial.println(threshold.value());
		maximum.push(threshold.value());
		Serial.println(maximum.value());
		derivative.push(maximum.value());
		Serial.println(derivative.value());

		if (prevDeriv >= 0 && derivative.value() < 0)
			peaks += 1;
		prevDeriv = derivative.value();
	}

	int count() {
		return peaks;
	}
};
