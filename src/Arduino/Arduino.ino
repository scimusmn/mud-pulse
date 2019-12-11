// Mud Pulse

// To be used with any 4D Systems Visi-Genie Gauges
// Reset operation is inverted, so that a 4D systems adaptor sheild is not needed.
// Connect TX on display connector to TX on Arduino
// Connect RX on display connenctor to RX on Arduino
// DO NOT power display using built-in 5V regulator on Arduino
// Refer to Visi-Genie Gauge documentation for object names

#include "arduino-base/Libraries/AnalogInput.h"
#include "arduino-base/Libraries/Button.h"
#include "arduino-base/Libraries/Timer.h"
#include "arduino-base/Libraries/SerialManager.h"

// Use library manager in the Arduino IDE to add this library
#include <genieArduino.h>

#define analogInput1Pin A0
#define resetLine 4
#define button1Pin 2

// Mud Pulse state management since we're using the button to do multiple things
int allowGraphing = 0;

// Stele communication
SerialManager serialManager;
long steleBaudRate = 115200;

// Genie communication
long genieBaudRate = 9600;

AnalogInput analogInput1;
int traceValue;
Button button1;
Genie genie;
Timer timer1;

int currentAnalogInput1Value = 0;
int pulseCount = 0;
bool newread = true;
int val = 0;
int timerDuration = 5000;
int peakValue = 0;
int threshold = 50;

void setup() {
  // Enables/disables debug messaging from ArduinoJson
  boolean arduinoJsonDebug = false;

  // Ensure Serial Port is open and ready to communicate
  serialManager.setup(steleBaudRate, [](char* message, int value) {
    onParse(message, value);
  }, arduinoJsonDebug);

  // LCD display is on hardware Serial1
  // Serial1.begin(genieBaudRate);
  // genie.Begin(Serial1);

  // Set D4 on Arduino to Output
  pinMode(resetLine, OUTPUT);

  // Reset the Display via D4
  digitalWrite(resetLine, 0);
  delay(100);

  // unReset the Display via D4
  digitalWrite(resetLine, 1);
  delay(4000);

  // ANALOG INPUTS
  // We need to do averaging or we'll crash the app
  boolean enableAverager = true;
  // Sampling Rate shoud be high to throw out unecessary data, but low enough to not impact performance
  int samplingRate = 5;
  // We don't want use LowPass because that will make the graph not as responsive
  boolean enableLowPass = false;
  analogInput1.setup(analogInput1Pin, enableAverager, samplingRate, enableLowPass, [](int analogInputValue) {

    currentAnalogInput1Value = analogInputValue;

    // Map values for scope plot
    traceValue = map(currentAnalogInput1Value, 0, 1023, 0, 100);
  });

  // DIGITAL INPUTS
  button1.setup(button1Pin, [](int state) {
    if (!state) {
      if (allowGraphing == 1) {
        if (timer1.isRunning() == false) {

          // Tell application to start listening to data
          serialManager.sendJsonMessage("button-press", 1);
          pulseCount = 0;

          // Get ready caption
          //genie.WriteObject(GENIE_OBJ_FORM, 1, 1);
          //delay(1000);

          // Get set...caption
          //genie.WriteObject(GENIE_OBJ_FORM, 2, 1);
          //delay(1000);

          // Go! caption
          //genie.WriteObject(GENIE_OBJ_FORM, 3, 1);
          //delay(500);

          // Clear previous data and write zeros width of scope display
          //for (int i = 0; i < 75; i++) {
          //  genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, 0);
          //}

          // Show live scope
          //genie.WriteObject(GENIE_OBJ_FORM, 0, 1);

          timer1.start();
        }
      }
      else {
        serialManager.sendJsonMessage("button-press", 1);
      }
    }
  });

  // TIMER
  timer1.setup([](boolean running, boolean ended, unsigned long timeElapsed) {
    if (running == true) {
      serialManager.sendJsonMessage("pressure-reading", currentAnalogInput1Value);
      if (currentAnalogInput1Value > 220 && newread == true) {
        newread = false;
        pulseCount++;
      }
      if (currentAnalogInput1Value < 190) {
        newread = true;
      }
    }
    else if (ended == true) {
      serialManager.sendJsonMessage("time-up", 1);
      serialManager.sendJsonMessage("material", pulseCount);
      // delay(1000);

      //message sent to computer caption
      // genie.WriteObject(GENIE_OBJ_FORM, 4, 1);

      //clear previous data and write zeros width of scope display
      // for (int i = 0; i < 75; i++) {
      //  genie.WriteObject(GENIE_OBJ_SCOPE, 0, 0);
      //}
      // delay(2000);

      // show live scope
      // genie.WriteObject(GENIE_OBJ_FORM, 0, 1);
    }
  }, timerDuration);
}

void loop() {
  analogInput1.idle();

  // Write the mapped values
  // genie.WriteObject(GENIE_OBJ_SCOPE, 0x00, traceValue);

  button1.idle();
  serialManager.idle();
  timer1.idle();
}


void onParse(char* message, int value) {
  if (strcmp(message, "allow-graphing") == 0) {
    allowGraphing = value;
    serialManager.sendJsonMessage("allow-graphing", allowGraphing);
  }
  else if (strcmp(message, "pressure-reading") == 0 && value == 1) {
    serialManager.sendJsonMessage(message, analogInput1.readValue());
  }
  else if (strcmp(message, "wake-arduino") == 0 && value == 1) {
    serialManager.sendJsonMessage("arduino-ready", 1);
  }
  else {
    serialManager.sendJsonMessage("unknown-command", 1);
  }
}
