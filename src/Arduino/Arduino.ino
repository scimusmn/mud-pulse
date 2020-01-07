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
int pulseCount = 0;
bool newread = true;
int val1;
int val2;
int timerDuration = 5000;
bool rising = false;
bool triggered = false;
// Set threshold band
int hysteresis = 20;
long timeNow;
// int peakValue = 0;
// int threshold = 50;

void setup() {
  // Enables/disables debug messaging from ArduinoJson
  boolean arduinoJsonDebug = false;

  // Ensure Serial Port is open and ready to communicate
  serialManager.setup(steleBaudRate, [](char* message, int value) {
    onParse(message, value);
  }, arduinoJsonDebug);

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

//  // ANALOG INPUTS
//  // We need to do averaging or we'll crash the app
//  boolean enableAverager = true;
//  // Sampling Rate shoud be high to throw out unecessary data, but low enough to not impact performance
//  int samplingRate = 5;
//  // We don't want use LowPass because that will make the graph not as responsive
//  boolean enableLowPass = false;
//
//  analogInput1.setup(analogInput1Pin, enableAverager, samplingRate, enableLowPass, [](int analogInputValue) {
//    currentAnalogInput1Value = analogInputValue;
//
//    if (allowGraphing == 1 && timer1.isRunning() == true) {
//      serialManager.sendJsonMessage("pressure-reading", currentAnalogInput1Value);
//    }
//
//    // Map values for scope plot
//    traceValue = map(currentAnalogInput1Value, 0, 1023, 0, 100);
//  });

  // TIMER
  timer1.setup([](boolean running, boolean ended, unsigned long timeElapsed) {
    if (running == true) {
      val1 = averagePressure;
      if (millis() > timeNow + 100) {
        val2 = averagePressure;
        timeNow = millis();
      }

      if (val1 >= val2 + hysteresis) {
        rising = true;
      } else if ((rising) && (val1 <= val2 - hysteresis)) {
        rising = false;
        triggered = true;
      }

      if (triggered) {
        pulseCount++;
        triggered = false;
      }
    }
    else if (ended == true) {
      serialManager.sendJsonMessage("time-up", 1);
      serialManager.sendJsonMessage("material", pulseCount);
    }
  }, timerDuration);
}

void loop() {
  averager.insertNewSample(analogRead(analogInput1Pin));
  averagePressure = averager.calculateAverage();  
  traceValue = map(averagePressure, 0, 1023, 0, 100);

  if (allowGraphing){
    serialManager.sendJsonMessage("pressure-reading", averagePressure);
  }
  
  // Write the mapped values  
  genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, traceValue);

  serialManager.idle();
  timer1.idle();
}

void onParse(char* message, int value) {
  if (strcmp(message, "allow-graphing") == 0) { // Tell arduino to send 5 sec of pres data
    allowGraphing = value;    
    if (allowGraphing){
     // serialManager.sendJsonMessage("graph", 1);
      if (timer1.isRunning() == false) {
      //  serialManager.sendJsonMessage("time", 0);
        pulseCount = 0;
        timer1.start();
        timeNow = millis();    
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
