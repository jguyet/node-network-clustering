# Jiji Cluster Network

Simple cluster network Node.js implementation using Master & Worker architecture

## Usage

This project can be used in situations where multiple servers are needed

## Requirements

* Node.js

## Install

Installation of master
```
cd cluster-master
npm install
```

Installation of worker

```
cd cluster-worker
npm install
```

## Run

### Master
```
node index.js --port 8080
```

### Worker
```
node index.js --port 9001 --password "abcdefg"
```