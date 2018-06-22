# [ModoSmart Agile](http://www.modosmart.com/)

This repository contains the Modosmart services that should be consumed by a client to connect to Modosmart devices over open source platform [Agile-IoT](http://agile-iot.eu/).

The [agile-iot](http://agile-iot.eu/) framework language-agnostic, modular software and hardware gateway framework for the Internet of Things with support for protocol interoperability, device and data management, IoT application execution, trusted data sharing and external Cloud communication.

This service is related to [agile-stack](https://github.com/Modosmart/agile-stack) repository and should be running as a part of the whole stack, as a docker container along with the rest of agile-stack services running on the same gateway.

### Running Modosmart application

To run this application steps from [agile-stack](https://github.com/Modosmart/agile-stack) should be followed.

### Architecture
![Architecture](https://raw.githubusercontent.com/mohamed-elsabagh/modosmart-agile/master/resources/architecture.png)


The previous figure, shows the full architecture of agile-stack running with ModoSmart service as containers over a docker engine running on the gateway (Raspberry pi).

The ModoSmart service application exposes endpoints to be consumed using [socket-io](https://socket.io/) node library by any device which can communicate over socket-io such as Android devices, IOS devices, or web browsers (Those devices will be called client devices or client application).

The commands sent over socket-io channel are then translated by the modosmart application into the equivalent Agile-IoT command and then using [agile-sdk](https://github.com/Agile-IoT/agile-sdk) the proper function is called from Agile-IoT framework and later the modosmart service will reply to the client with the output message.

For example a full scan of all BLE nearby devices, can be achieved from an Android phone app, by sending a command requesting from modosmart application to run the discovery command, and then the modosmart service using agile-sdk will call proper function from agile-stack to start scanning nearby devices, and will later reply the client (Android device) with list of all nearby devices.

### ModoSmart BLE sensors


| 128 bit UUID                          | short UUID    | BLE Service name          | BLE Characteristic name |
| :-----------------------------------: |:-------------:|:------------------------: |:------------------------: |
| 0000A000-0000-1000-8000-00805f9b34fb  | 0xA000        |Environmental data service ||
| 0000A001-0000-1000-8000-00805f9b34fb  | 0xA001        |                           |Presence detection|
| 00002A6E-0000-1000-8000-00805f9b34fb  | 0x2A6E        |                           |Temperature|
| 00002A6F-0000-1000-8000-00805f9b34fb  | 0x2A6F        |                           |	Humidity|
| 0000180F-0000-1000-8000-00805f9b34fb  | 0x180F        |	Battery service           ||
| 00002A19-0000-1000-8000-00805f9b34fb  | 0x2A19        |                           |Battery level|
| 0000180A-0000-1000-8000-00805f9b34fb  | 0x180A        |Device Information Service ||
| 00002A26-0000-1000-8000-00805f9b34fb  | 0x2A26        |                           |Firmware Revision String||


#### Window Sensor
| 128 bit UUID                          | short UUID    | BLE Service name          | BLE Characteristic name |
| :-----------------------------------: |:-------------:|:------------------------: |:------------------------: |
| 0000180F-0000-1000-8000-00805f9b34fb  | 0x180F        |Battery service            ||
| 00002A19-0000-1000-8000-00805f9b34fb  | 0x2A19        |                           |Battery level|
| 0000180A-0000-1000-8000-00805f9b34fb  | 0x180A        |Device Information Service||
| 00002A26-0000-1000-8000-00805f9b34fb  | 0x2A26        |                           |	Firmware Revision String||

Reading the Modosmart BLE sensors (Room Sensor and Window Sensor) values, can be done from the client application side by following next steps.

1. Client application will request a full discovery for the nearby devices and check the Modosmart devices, and because the [agile-core](https://github.com/mohamed-elsabagh/agile-core) is configured to allow connecting to Modosmart Sensors, a BLE Connection can be made to the required device later.

2. Modosmart BLE specific characteristic can be read as long as the deivce is connected.

3. The client application can show live readings from the Modosmart BLE sensors.

### ModoSmart AC Switch

Modosmart AC switch is a TCP server, which accepts connection from any TCP client.

ModoSmart serivce application will act as a TCP client, which get one of three commands form the client devices over socket-io and send them over TCP to the AC switch.

The three commands are:
1. Get status of AC
2. Switch AC ON
3. Switch AC OFF

### Further configurations

Assuming that Client application, Modosmart service application, and Modosmart AC switch are all connected to the same WiFi network, IP addresses and ports should be configured from Modosmart service application side for ensuring proper connection.

on Dockerfile before building the image and running the container,
```
# IP address of TCP server
ENV TCP_SERVER_IP 192.168.1.110
# Port of TCP server
ENV TCP_SERVER_PORT 3310
```

TCP_SERVER_IP: is the IP address of the AC switch
TCP_SERVER_PORT: is the port of the AC

The IP address of gateway should be also configured to point to the host ip address (resin os)
```
# IP address of host machine
ENV RESIN_HOST_IP 192.168.1.105
```
