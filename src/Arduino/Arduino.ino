#include "arduino-base/Libraries/AnalogInput.h"
#include "arduino-base/Libraries/Button.h"
#include "arduino-base/Libraries/SerialManager.h"

SerialManager serialManager;

long baudRate = 115200;

AnalogInput analogInput1;
Button button1;

// Pin assignments
#define analogInput1Pin A0
#define button1Pin 2

boolean doPolling = false;
long timeNow = 0;
int count = 0;
bool newread = true;
int val = 0;
int timerDuration = 5000; //5 second timer

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
      if (doPolling == false) {
        doPolling = true;
        timeNow = millis();
        serialManager.sendJsonMessage("button-press", 1);
      }
    }
  });
}

void loop() {
  analogInput1.idle();
  button1.idle();
  serialManager.idle();

  if (doPolling == true) {
    listenData();
  }
  else {
    // 2: Limestone
    // 3: Dolomite
    // 4: Shale
    // 5: Sandstone

    if (count > 1 && count < 5) {
      serialManager.sendJsonMessage("material", count);
      count = 0;
    }
  }
}

void listenData() {
  // 5 second timer
  if (millis() < timeNow + timerDuration) {
    val = analogRead(0);
    delay(2);

    if ((val > 200) && (newread)) {
      newread = false;
      count = count + 1;
    }

    if (val < 190) {
      newread = true;
    }
  }
  else {
    doPolling = false;
    serialManager.sendJsonMessage("time-up", 1);
  }
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
