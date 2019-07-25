// MudPulse

#include "arduino-base/Libraries/AnalogInput.h"
#include "arduino-base/Libraries/Button.h"
#include "arduino-base/Libraries/SerialManager.h"
#include "arduino-base/Libraries/Timer.h"

SerialManager serialManager;

long baudRate = 115200;

AnalogInput analogInput1;
Button button1;
Timer timer1;

// Pin assignments
#define analogInput1Pin A0
#define button1Pin 2

int threshold = 50;
int minThreshold = 100;
int pulseCount = 0;
bool newread = true;
int val = 0;
int timerDuration = 5000;
int peakValue = 0;
int previousPeak = 0;
bool peakDetected = true;


void setup() {
  // Enables/disables debug messaging from ArduinoJson
  boolean arduinoJsonDebug = false;

  // Ensure Serial Port is open and ready to communicate
  serialManager.setup(baudRate, [](char* message, int value) {
    onParse(message, value);
  }, arduinoJsonDebug);

  // ANALOG INPUTS

  // We need to do averaging or we'll crash the app
  boolean enableAverager = true;
  // Sampling Rate shoud be high to throw out unecessary data, but low enough to not impact performance
  int samplingRate = 200;
  // We don't want use LowPass because that will make the graph not as responsive
  boolean enableLowPass = false;

  analogInput1.setup(analogInput1Pin, enableAverager, samplingRate, enableLowPass, [](int analogInputValue) {
    serialManager.sendJsonMessage("pressure-reading", analogInputValue);
  });

  // DIGITAL INPUTS

  // Parameter 1: pin location
  // Parameter 2: callback

  button1.setup(button1Pin, [](int state) {
    if (state) {
      if (timer1.isRunning() == false) {
        pulseCount = 0;
        timer1.start();
      }

      serialManager.sendJsonMessage("button-press", 1);
    }
  });

  timer1.setup([](boolean running, boolean ended, unsigned long timeElapsed) {
    if (running == true) {
      val = analogRead(A0);
      if (val > peakValue) { // check if it's higher than the current peak:
        peakValue = val;
      }
      else if (val < 100) {
        peakValue = 0;
        previousPeak = 0;
      }
      if (val > minThreshold && val <= peakValue - threshold) {
        previousPeak = peakValue;
        if (peakValue > threshold && peakDetected) {
          peakDetected = false;
          pulseCount++;
          Serial.println(pulseCount);
          peakValue = 0;
        }
      }
      if (val >= previousPeak) {
        peakDetected = true;
      }
      else if (ended == true) {
        serialManager.sendJsonMessage("time-up", 1);
        serialManager.sendJsonMessage("material", pulseCount);
      }
    }
  }, timerDuration);
}

void loop() {
  analogInput1.idle();
  button1.idle();
  serialManager.idle();
  timer1.idle();
}

void onParse(char* message, int value) {
  if (strcmp(message, "pressure-reading") == 0 && value == 1) {
    serialManager.sendJsonMessage(message, analogInput1.readValue());
  }
  else if (strcmp(message, "wake-arduino") == 0 && value == 1) {
    serialManager.sendJsonMessage("arduino-ready", 1);
  }
  else {
    serialManager.sendJsonMessage("unknown-command", 1);
  }
}
