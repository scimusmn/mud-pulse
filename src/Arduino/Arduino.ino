// Mud Pulse

// To be used with any 4D Systems Visi-Genie Gauges
// Reset operation is inverted, so that a 4D systems adaptor sheild is not needed.
// Connect TX on display connector to TX on Arduino
// Connect RX on display connenctor to RX on Arduino
// DO NOT power display using built-in 5V regulator on Arduino
// Refer to Visi-Genie Gauge documentation for object names

#include "arduino-base/Libraries/Averager.h"/
#include "arduino-base/Libraries/Timer.h"
#include "arduino-base/Libraries/SerialManager.h"

// Use library manager in the Arduino IDE to add this library
#include <genieArduino.h>

#define analogInput1Pin A0
#define resetLine 4

// Mud Pulse state management since we're using the button to do multiple things
int allowGraphing = 0;

// Stele communication
SerialManager serialManager;
long steleBaudRate = 115200;

// Genie communication
long genieBaudRate = 9600;

int traceValue;
Genie genie;
Timer timer1;
Averager averager;

int averagePressure = 0;
int lastAvgPres = 0;
int pulseCount = 0;
int millisBetweenSample = 5;
int timerDuration = 5000;
bool rising = false;
// Set threshold band
int hysteresis = 20;
unsigned long graphStartMillis;
unsigned long currentMillis;
unsigned long lastSampleMillis;

// int peakValue = 0;
// int threshold = 50;

void setup() {
  averager.setup(10, false);

  // Enables/disables debug messaging from ArduinoJson
  boolean arduinoJsonDebug = false;

  // Ensure Serial Port is open and ready to communicate
  serialManager.setup(steleBaudRate, [](char* message, int value) {
    onParse(message, value);
  }, arduinoJsonDebug);

  //   LCD display is on hardware Serial1
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

  // end graphing after 5 sec
  if ((currentMillis - graphStartMillis > timerDuration) && (allowGraphing)) {
    allowGraphing = 0;
    serialManager.sendJsonMessage("time-up", 1);
    serialManager.sendJsonMessage("material", pulseCount);
  }

  // take a sample every 'millisBetweenSample'
  if (currentMillis - lastSampleMillis > millisBetweenSample) {
    averager.insertNewSample(analogRead(analogInput1Pin));
    averagePressure = averager.calculateAverage();

    traceValue = map(averagePressure, 0, 1023, 0, 100);

    // if graphing, monitor for pulses and send pressure data to Stele
    if (allowGraphing) {
      if (averagePressure >= lastAvgPres + hysteresis) {
        rising = true;

      //if it was rising but is now falling, count a pulse.
      } else if ((rising) && (averagePressure <= lastAvgPres - hysteresis)) {
        rising = false;
        pulseCount++;
      }
      // send a pres reading to stele
      serialManager.sendJsonMessage("pressure-reading", averagePressure);
    }


    // Write the mapped values to small screen
//    genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, traceValue);

    //store info for last reading
    lastAvgPres = averagePressure;
    lastSampleMillis = currentMillis;
  }

  serialManager.idle();
}

void onParse(char* message, int value) {

  //listen for request of 5 sec of pressure data
  if (strcmp(message, "allow-graphing") == 0) { // Tell arduino to send 5 sec of pres data
    allowGraphing = value;
    if (allowGraphing) {
      if (timer1.isRunning() == false) {
        pulseCount = 0;
        graphStartMillis = millis();
      }
    }
  }
  else if (strcmp(message, "wake-arduino") == 0 && value == 1) {
    serialManager.sendJsonMessage("arduino-ready", 1);
  }
  else {
    serialManager.sendJsonMessage("unknown-command", 1);
  }
}
