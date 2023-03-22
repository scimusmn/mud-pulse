#include <math.h>
#include <stdlib.h>
// Mud Pulse

#include "arduino-base/Libraries/SerialController.hpp"
#include "PeakCounter.hpp"

#define analogInput1Pin A0
#define resetLine 4

// Stele communication
SerialController serialController;
long steleBaudRate = 115200;

int allowGraphing = 0;  // flag that sends pres data to stele
int pressure = 0; // stores the pressure
int traceValue;  // 0-100 sent to 4D display
int millisBetweenSample = 5; //millis between taking analog read
int timerDuration = 5000;  // time in millis to send pressure data

float time = 0;
float F = 0.2;
int fakePressureReading() {
	float value = sin(F * 3.141592 * time);
	value = pow(value, 10/F);
	time = time + 0.05;
	return 1024 * value;
}

PeakCounter<5> peaks(300, 1023, float(millisBetweenSample)/1000);


// Set threshold band
int hysteresis = 20;
unsigned long graphStartMillis;
unsigned long currentMillis;
unsigned long lastSampleMillis;

void setup() {
  // Ensure Serial Port is open and ready to communicate
  serialController.setup(steleBaudRate, [](char* message, char* value) {
    onParse(message, value);
  });

  pinMode(analogInput1Pin, INPUT);
}

void loop() {
  currentMillis = millis();

  // end graphing after timerDuration
  if ((currentMillis - graphStartMillis > timerDuration) && allowGraphing) {
    allowGraphing = 0;
    serialController.sendMessage("time-up", 1);
    serialController.sendMessage("material", peaks.count());
  }

  // take a sample every 'millisBetweenSample'
  if (currentMillis - lastSampleMillis > millisBetweenSample) {
    //pressure = analogRead(analogInput1Pin);
    pressure = fakePressureReading();

    // scale pressure data for 4d display
    traceValue = map(pressure, 0, 1023, 0, 100);
    //traceValue = map(peaks.avg.value(), 0, 1023, 0, 100);

    // if graphing, monitor for pulses and send pressure data to Stele
    if (allowGraphing) {
      peaks.push(pressure);

      // send a pressure reading to stele
      serialController.sendMessage("pressure-reading", pressure);
    }

    // store info for last reading
    lastSampleMillis = currentMillis;
  }

  serialController.update();
}

void onParse(char* message, char* value) {
  // listen for request of 5 sec of pressure data
  if (strcmp(message, "allow-graphing") == 0 && atoi(value) == 1) {
    // Tell arduino to send 5 sec of pres data
    allowGraphing = value;

    if (allowGraphing) {
      peaks.reset();
      time = 0;
      F = ((float)rand()) / RAND_MAX;
      graphStartMillis = millis();
    }
  }
  else if (strcmp(message, "wake-arduino") == 0 && atoi(value) == 1) {
    serialController.sendMessage("arduino-ready", 1);
  }
  else {
    serialController.sendMessage("unknown-command", 1);
  }
}
