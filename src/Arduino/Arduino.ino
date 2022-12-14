// Mud Pulse

// To be used with any 4D Systems Visi-Genie Gauges
// Reset operation is inverted, so that a 4D systems adaptor sheild is not needed.
// Connect TX on display connector to TX on Arduino
// Connect RX on display connenctor to RX on Arduino
// DO NOT power display using built-in 5V regulator on Arduino
// Refer to Visi-Genie Gauge documentation for object names

#include "arduino-base/Libraries/SerialController.hpp"
#include "PeakCounter.hpp"

// Use library manager in the Arduino IDE to add this library
// GENIE #include <genieArduino.h>
#include <genieArduino.h>

#define analogInput1Pin A0
#define resetLine 4

// Stele communication
SerialController serialController;
long steleBaudRate = 115200;

// Genie communication
long genieBaudRate = 9600;

Genie genie;

int allowGraphing = 0;  // flag that sends pres data to stele
int pressure = 0; // stores the pressure
int traceValue;  // 0-100 sent to 4D display
int millisBetweenSample = 5; //millis between taking analog read
int timerDuration = 5000;  // time in millis to send pressure data

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

  // LCD display is on hardware Serial1
  Serial1.begin(genieBaudRate);
  genie.Begin(Serial1);

  pinMode(analogInput1Pin, INPUT);

  // Set D4 on Arduino to Output
  pinMode(resetLine, OUTPUT);

  // Reset the Display via D4
  digitalWrite(resetLine, 0);
  delay(100);

  // unReset the Display via D4
  digitalWrite(resetLine, 1);
  delay(4000);
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
    pressure = analogRead(analogInput1Pin);

    // scale pressure data for 4d display
    traceValue = map(pressure, 0, 1023, 0, 100);
    //traceValue = map(peaks.avg.value(), 0, 1023, 0, 100);

    // if graphing, monitor for pulses and send pressure data to Stele
    if (allowGraphing) {
      peaks.push(pressure);

      // send a pressure reading to stele
      serialController.sendMessage("pressure-reading", pressure);
    }

    // Write the mapped values to small screen
    genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, traceValue);

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
