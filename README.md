# [ModoSmart Agile API](http://www.modosmart.com/)

This repository contains the api that should be consumed by a client to connect to modosmart devices as well as the technical steps needed to build a [modosmart](http://www.modosmart.com/) application device based on [agile-iot](http://agile-iot.eu/) open source platform.

The [agile-iot](http://agile-iot.eu/) framework language-agnostic, modular software and hardware gateway framework for the Internet of Things with support for protocol interoperability, device and data management, IoT application execution, trusted data sharing and external Cloud communication.

The full [agile-iot](http://agile-iot.eu/) stack consists of several services defined in the [agile-stack](https://github.com/Agile-IoT/agile-stack) docker-compose.yml file.

Each of those service source code is available in the [agile-iot github channel](https://github.com/Agile-IoT)

To build a custom image from any of those services a local source folder should be cloned to the developing machine and then a docker image should be built from the source code. Another option if no changes need to be done over the source code is to pull pre-built working image from [agile-iot docker hub](https://hub.docker.com/r/agileiot/)

### Building Modosmart application

#### Step 1: Flash a resinos into the raspberry pi 3
 follow the [official instructions](https://resinos.io/docs/raspberrypi3/gettingstarted/) for installing resinos into a raspberry pi

#### Step 2: Clone agile stack to the local machine [agile-stack](https://github.com/Agile-IoT/agile-stack)

In our tests the following versions are used which are the current latest version for all the required services.

| Image/Container   | Version/Tag   |
| -------------     |:-------------:|
| agile-dbus        | v0.13         |
| agile-core        | v0.2.14       |
| agile-ble         | v0.1.9        |
| agile-dummy       | v0.2.4        |
| agile-ui          | v2.3.0        |
| agile-osjs        | v0.3.0        |
| agile-nodered     | secure-sharing-8ce0f6075032cf2ad4870ddc7333853fa4622cfa        |
| agile-security    | v3.7.3        |
| agile-data        | v0.1.0        |
| agile-recommender | v0.3.6        |

Copy ```.env.example``` to ```.env``` and update ```docker-compose.yml``` to the versions mentioned in the previous table.

#### Step 3: Customize agile-core to add modosmart devices

For adding modosmart BLE device which is a normal GATT server with specific service and characteristics UUID, a new device must be added to the device factory with the required info.

Porting example java class to ModosmartDevice.java
```
/*******************************************************************************
 * Copyright (C) 2017 Create-Net / FBK.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License 2.0
 * which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-2.0/
 *
 * Contributors:
 *     Create-Net / FBK - initial API and implementation
 ******************************************************************************/
package org.eclipse.agail.device.instance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.freedesktop.dbus.DBusSigHandler;
import org.freedesktop.dbus.exceptions.DBusException;
import org.eclipse.agail.Device;
import org.eclipse.agail.Protocol;
import org.eclipse.agail.Protocol.NewRecordSignal;
import org.eclipse.agail.device.base.AgileBLEDevice;
import org.eclipse.agail.device.base.SensorUuid;
import org.eclipse.agail.object.DeviceDefinition;
import org.eclipse.agail.object.DeviceOverview;
import org.eclipse.agail.object.RecordObject;
import org.eclipse.agail.object.DeviceComponent;
import org.eclipse.agail.exception.AgileNoResultException;

public abstract class ModosmartDevice extends AgileBLEDevice implements Device {
  protected Logger logger = LoggerFactory.getLogger(ModosmartDevice.class);
  protected static final Map<String, SensorUuid> sensors = new HashMap<String, SensorUuid>();
  private static final String Temperature = "Temperature";

	{
		subscribedComponents.put(Temperature, 0);
	}

 	{
		profile.add(new DeviceComponent(Temperature, ""));
	}


 	static {
		sensors.put(Temperature, new SensorUuid("000000ff-0000-1000-8000-00805f9b34fb", "0000ff01-0000-1000-8000-00805f9b34fb", "", ""));
	}

	public static boolean Matches(DeviceOverview d) {
		return d.name.contains("MODOSMART");
	}

	public static String deviceTypeName = "MODOSMART";

	public ModosmartDevice(DeviceOverview deviceOverview) throws DBusException {
		super(deviceOverview);
	}


	public ModosmartDevice(DeviceDefinition devicedefinition) throws DBusException {
		super(devicedefinition);
	}

	@Override
	public void Connect() throws DBusException {
		super.Connect();
		for (String componentName : subscribedComponents.keySet()) {
			logger.info("Modosmart Connect: " + componentName);
			//DeviceRead(componentName);
			if (subscribedComponents.get(componentName) > 0) {
				logger.info("Resubscribing to {}", componentName);
				deviceProtocol.Subscribe(address, getReadValueProfile(componentName));
			}
		}
	}


  @Override
  protected String DeviceRead(String componentName) {
	logger.info("Modosmart DeviceRead: "+ componentName);
    if ((protocol.equals(BLUETOOTH_LOW_ENERGY)) && (deviceProtocol != null)) {
      if (isConnected()) {
        if (isSensorSupported(componentName.trim())) {
          try {
            byte[] result = deviceProtocol.Read(address, getReadValueProfile(componentName));
            return formatReading(componentName, result);
          } catch (DBusException e) {
            e.printStackTrace();
          }
        } else {
          throw new AgileNoResultException("Sensor not supported:" + componentName);
        }
      } else {
        throw new AgileNoResultException("BLE Device not connected: " + deviceName);
      }
    } else {
      throw new AgileNoResultException("Protocol not supported: " + protocol);
    }
    throw new AgileNoResultException("Unable to read "+componentName);
  }


 @Override
  public synchronized void Subscribe(String componentName) {
    if ((protocol.equals(BLUETOOTH_LOW_ENERGY)) && (deviceProtocol != null)) {
      if (isConnected()) {
        if (isSensorSupported(componentName.trim())) {
          try {
            if (!hasOtherActiveSubscription(componentName)) {
              deviceProtocol.Subscribe(address, getReadValueProfile(componentName));
              addNewRecordSignalHandler();
            }
	    logger.info("Modosmart Subscribe");
            subscribedComponents.put(componentName, subscribedComponents.get(componentName) + 1);
          } catch (Exception e) {
            e.printStackTrace();
          }
        } else {
          throw new AgileNoResultException("Sensor not supported:" + componentName);
        }
      } else {
        throw new AgileNoResultException("BLE Device not connected: " + deviceName);
      }
    } else {
      throw new AgileNoResultException("Protocol not supported: " + protocol);
    }
  }

 @Override
  public synchronized void Unsubscribe(String componentName) throws DBusException {
    if ((protocol.equals(BLUETOOTH_LOW_ENERGY)) && (deviceProtocol != null)) {
      if (isConnected()) {
        if (isSensorSupported(componentName.trim())) {
          try {
            subscribedComponents.put(componentName, subscribedComponents.get(componentName) - 1);
            if (!hasOtherActiveSubscription(componentName)) {
              deviceProtocol.Unsubscribe(address, getReadValueProfile(componentName));
              removeNewRecordSignalHandler();
            }
          } catch (Exception e) {
            e.printStackTrace();
          }
        } else {
          throw new AgileNoResultException("Sensor not supported:" + componentName);
        }
      } else {
        throw new AgileNoResultException("BLE Device not connected: " + deviceName);
      }
    } else {
      throw new AgileNoResultException("Protocol not supported: " + protocol);
    }
  }

@Override
  public void Write(String componentName, String payload) {
            logger.debug("Device. Write not implemented");
	}

@Override
  public void Execute(String command) {
            logger.debug("Device. Execute not implemented");
	}

  @Override
  public List<String> Commands(){
            logger.debug("Device. Commands not implemented");
            return null;
      }

	// =======================Utility methods===========================

	private Map<String, String> getReadValueProfile(String sensorName) {
		Map<String, String> profile = new HashMap<String, String>();
		SensorUuid s = sensors.get(sensorName);
		if (s != null) {
			profile.put(GATT_SERVICE, s.serviceUuid);
			profile.put(GATT_CHARACTERSTICS, s.charValueUuid);
			logger.info("Modosmart Gatt Service: "+s.serviceUuid);
			logger.info("Modosmart Gatt Characteristic: "+s.charValueUuid);
		}
		return profile;
	}

	@Override
	protected boolean isSensorSupported(String sensorName) {
		return sensors.containsKey(sensorName);
	}



	/**
	 * Checks if there is another active subscription on the given component of
	 * the device
	 *
	 * @param componentName
	 * @return
	 */
	@Override
	protected boolean hasOtherActiveSubscription(String componentName) {
		for (String component : subscribedComponents.keySet()) {
			if (subscribedComponents.get(component) > 0) {
				return true;
			}
		}
		return false;
	}

	@Override
	protected String formatReading(String componentName, byte[] readData) {
			int resultX = 0;
			int resultY = 0;
			int resultZ = 0;
			String value = "";
		switch (componentName) {
		   case Temperature:
		}
		return "0";
	}

	/**

	 */
	@SuppressWarnings("unchecked")
	@Override
	protected void addNewRecordSignalHandler() {
		logger.info("Modosmart addNewRecordSignalHandler");
		try {
			if (newRecordSigHanlder == null && connection != null) {
 				newRecordSigHanlder = new DBusSigHandler<Protocol.NewRecordSignal>() {
					@Override
					public void handle(NewRecordSignal sig) {
						if (sig.address.equals(address)) {
 							for(String componentName : getComponentNames(sig.profile)){
 								String readVal = formatReading(componentName, sig.record);
 								if (Float.parseFloat(readVal) != 0.0) {
 									RecordObject recObj = new RecordObject(deviceID, componentName,
 											formatReading(componentName, sig.record), getMeasurementUnit(componentName), "",
 											System.currentTimeMillis());
 									data = recObj;
 									logger.info("Device notification component {} value {}", componentName, recObj.value);
 									lastReadStore.put(componentName, recObj);
 									try {
 										Device.NewSubscribeValueSignal newRecordSignal = new Device.NewSubscribeValueSignal(
 												AGILE_NEW_RECORD_SUBSCRIBE_SIGNAL_PATH, recObj);
 										connection.sendSignal(newRecordSignal);
 									} catch (DBusException e) {
 										e.printStackTrace();
 									}
 								}
 							}
						}
					}
				};
				connection.addSigHandler(Protocol.NewRecordSignal.class, newRecordSigHanlder);
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Given the profile of the component returns the list of component names
	 *
	 * @param uuid
	 * @return
	 */
 	protected List<String> getComponentNames(Map<String, String> profile) {
		List<String> ret = new ArrayList<String>();
		String serviceUUID = profile.get(GATT_SERVICE);
		String charValueUuid = profile.get(GATT_CHARACTERSTICS);
		for (Entry<String, SensorUuid> su : sensors.entrySet()) {
			if (su.getValue().serviceUuid.equals(serviceUUID) && su.getValue().charValueUuid.equals(charValueUuid)) {
				ret.add(su.getKey());
			}
		}
		return ret;
	}

 	@Override
	protected String getMeasurementUnit(String sensor) {
 		return "";
 	}

  /**
   * Given the profile of the component returns the name of the sensor
   *
   * @param uuid
   * @return
   */
  @Override
  protected String getComponentName(Map<String, String> profile) {
    String serviceUUID = profile.get(GATT_SERVICE);
    String charValueUuid = profile.get(GATT_CHARACTERSTICS);
    for (Entry<String, SensorUuid> su : sensors.entrySet()) {
      if (su.getValue().serviceUuid.equals(serviceUUID) && su.getValue().charValueUuid.equals(charValueUuid)) {
        return su.getKey();
      }
    }
    return null;
  }
}

```

#### Step 4: Run all dockers services

Bluetooth must be disabled in the host because the [agil-ble](https://github.com/Agile-IoT/agile-ble) service will initialize it.

Enable the HCI adapter and disable the bluetooth daemon in the host
```
ssh root@resin.local -p22222 'mount -o remount,rw / && systemctl disable bluetooth && sed -i "s/i2c-dev/i2c-dev\n\/usr\/bin\/hciattach \/dev\/ttyAMA0 bcm43xx 921600 noflow -/" /usr/bin/resin-init-board && mount -o remount,ro / && /usr/bin/hciattach /dev/ttyAMA0 bcm43xx 921600 noflow -'
```

Using the latest version of resinOS which is v2.12.3 the last command causes a conflict in bluetooth driver, which makes agile-ble service unable to initialize Bluez, instead the following commands should be executed from the host

```
systemctl stop bluetooth
systemctl disable bluetooth
```

Now run all services on the gateway

```
sudo docker-compose up
```
This might take quiet sometime for the first time, but later all the changes will be cached for the next building.


#### Step 5: Scan for the nearby device

After all services are up and running, go to the browser and go to ```http://resin.local:8000``` and login with default credentials username is ```agile``` and password is ```secret```

Go to device manager and turn on discovery, you should see list updating with nearby devices.

Choose ModosmartDevice and connect to it, and this should add ModosmartDevice to the added devices.
