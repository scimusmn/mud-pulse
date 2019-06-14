#include "arduino-base/Libraries/AnalogInput.h"
#include "arduino-base/Libraries/Button.h"
#include "arduino-base/Libraries/SerialManager.h"

SerialManager manager;

long baudRate = 115200;

AnalogInput analogInput1;
Button button1;

// Pin assignments
int analogInput1Pin = A0;
int button1Pin = 2;

boolean doPolling = false;
long timeNow = 0;
int count = 0;
bool newread = true;
int val = 0;
int timerDuration = 5000; //5 second timer

void setup() {

  // Ensure Serial Port is open and ready to communicate
  manager.setup(baudRate, [](String message, int value) {
    onParse(message, value);
  });

  // ANALOG INPUTS

  // We need to do averaging or we'll crash the app
  boolean enableAverager = true;
  // We don't want use LowPass because that will make the graph not as responsive
  boolean enableLowPass = false;

  analogInput1.setup(analogInput1Pin, enableAverager, enableLowPass, [](int analogInputValue) {
    manager.sendJsonMessage("pressure-reading", analogInputValue);
  });

  // DIGITAL INPUTS

  // Parameter 1: pin location
  // Parameter 2: callback

  button1.setup(button1Pin, [](int state) {
    if (state) {
      if (doPolling == false) {
        doPolling = true;
        timeNow = millis();
        manager.sendJsonMessage("button-press", 1);
      }
    }
  });
}

void loop() {
  manager.idle();

  analogInput1.idle();
  button1.idle();

  if (doPolling == true) {
    listenData();
  }
  else {
    // 2: Limestone
    // 3: Dolomite
    // 4: Shale
    // 5: Sandstone

    if (count > 1 && count < 5) {
        manager.sendJsonMessage("material", count);
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
    manager.sendJsonMessage("time-up", 1);
  }
}

void onParse(String message, int value) {
  if (message == "\"pressure-reading\"" && value == 1) {
    manager.sendJsonMessage("pressure-reading", analogInput1.readValue());
  }
  else {
    manager.sendJsonMessage("unknown-command", 1);
  }
}
