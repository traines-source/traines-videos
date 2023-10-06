from xml.sax import make_parser, handler
import json
import csv
import re

stations = {}

class TrainHandler(handler.ContentHandler):
    def __init__(self):
        self.trains_encountered = False
        self.reading_train = False
        self.reading_line_number = False
        self.line_number = ""
        self.station_codes = {}
        self.connections = {}
        self.last_eva = None
        self.skip_train_part = False
        self.counters = {}
        self.counters["total"] = 0
        self.counters["trainParts"] = 0

    def startElement(self, name, attrs):
        if self.trains_encountered:
            if name == "train":
                self.reading_train = True
            elif name == "virBase:lineNumber" or name == "lineNumber":
                self.reading_line_number = True
        elif name == "trains":
            print("Encountered trains")
            self.trains_encountered = True
        elif name == "trainParts":
            print("Encountered trainParts")
            with open('overrides.json', 'r') as json_file:
                overrides = json.load(json_file)
                self.station_codes.update(overrides)
        elif name == "trainPart":
            if not attrs.getValue("categoryRef") in self.counters:
                self.counters[attrs.getValue("categoryRef")] = 0
            self.counters[attrs.getValue("categoryRef")] += 1
            if attrs.getValue("categoryRef") in ("catA", "catC", "catD", "catB", "catGK", "catGF", "catG", "catAS"): #catF, catH "catA", "catC", "catD", "catB", 
                self.skip_train_part = True
            else:
                self.counters["trainParts"] += 1
        elif name == "ocpTT":
            eva = self.station_codes[attrs.getValue("ocpRef")]["eva"]
            if not self.skip_train_part and attrs.getValue("ocpType") == "stop":
                if eva in stations:
                    if self.last_eva is not None:
                        a = eva if eva < self.last_eva else self.last_eva
                        b = self.last_eva if eva < self.last_eva else eva
                        if (a,b) not in self.connections:
                            self.connections[(a,b)] = 0
                        self.connections[(a,b)] += 1
                        stations[eva]["dtakt"] += 1
                    self.last_eva = eva
                else:
                    self.station_codes[attrs.getValue("ocpRef")]["missing"] = True
                    self.station_codes[attrs.getValue("ocpRef")]["counter"] += 1
        elif name == "ocp":
            self.station_codes[attrs.getValue("id")] = {"eva": attrs.getValue("code"), "name": attrs.getValue("name"), "counter": 0}
    
    def characters(self, content):
        if self.reading_line_number:
            self.line_number += content
        
    def endElement(self, name):
        if name == "train":
            self.counters["total"] += 1
            if self.counters["total"] % 1000 == 0:
                print("Read", self.counters["total"], "trains on", len(self.counters)-1, "distinct lines")
            self.reading_train = False
        elif name == "virBase:lineNumber" or name == "lineNumber":
            if self.line_number not in self.counters:
                self.counters[self.line_number] = 0
            self.counters[self.line_number] += 1
            self.line_number = ""
            self.reading_line_number = False
        elif name == "trainPart":
            self.skip_train_part = False
            self.last_eva = None



def convertlonlat(s):
    return float(s.replace(',', '.'))

def cleanifopt(s):
    return re.sub(r"^([^:_]+:[^:_]+:[^:_]+)(_[^:]+)?(:.+)?$", r"\1", s)

with open('/in/hafas-ibnr-zhv-gtfs-osm-matching/D_Bahnhof_2020_alle.CSV') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=';')
    line_count = 0
    for row in csv_reader:
        if line_count > 0:
            sub = row[1].split(',')
            for s in sub:
                stations[s] = {'ifopt': row[2], 'name': row[3], 'lon': convertlonlat(row[5]), 'lat': convertlonlat(row[6]), 'dtakt': 0, 'gtfs': 0}
        line_count += 1
    print(f'Imported {line_count} stations.')

with open('gtfs-2023-departures.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    ifopt_stations = {}
    line_count = 0
    for row in csv_reader:
        if line_count > 0:
            ifopt_parent = cleanifopt(row[0])
            print(ifopt_parent)
            if not ifopt_parent in ifopt_stations:
                ifopt_stations[ifopt_parent] = 0
            ifopt_stations[ifopt_parent] += int(row[1])
        line_count += 1
    ifopt_counter = 0
    for s in stations:
        ifopt = cleanifopt(stations[s]["ifopt"])
        if ifopt in ifopt_stations:
            stations[s]["gtfs"] = ifopt_stations[ifopt]
            ifopt_counter += 1
    print(f'Imported {ifopt_counter} gtfs stations.')
        

update = True
if update:
    print("Reading...")
    parser = make_parser()
    h = TrainHandler()
    parser.setContentHandler(h)
    parser.parse("/in/german-gtfs/deutschlandtakt/200713_3GE_FV,NV,SGV_Export_fixed.railml")

    print(h.counters)
    connection_list = []
    for key, value in h.connections.items():
        connection_list.append((key[0], key[1], value/24/2))
    for key in stations:
        stations[key]['dtakt'] /= 24*2
        stations[key]['gtfs'] /= 6*2
    with open('analysis-dtakt-railml.json', 'w') as json_file:
        out = {"counters": h.counters, "connections": connection_list, "stations": stations, "codes": h.station_codes}
        json.dump(out, json_file)

with open('analysis-dtakt-railml.json', 'r') as json_file:
    counters = json.load(json_file)["counters"]
    print("Total: ", counters["total"])
    #print("Sum: ", sum(counters.values())-counters["total"]-counters["trainParts"])

    fv = sum([v for k, v in counters.items() if k.startswith("FV")])
    fr = sum([v for k, v in counters.items() if k.startswith("FR")])
    print("FV:", fv)
    print("FR:", fr)
    print("Rest (RV):", (counters["total"]-fv-fr))


