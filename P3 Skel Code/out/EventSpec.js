import { Err } from "./Err.js";
import { Check } from "./Check.js";
const evtTypeStrings = ['press', 'release', 'release_none', 'enter', 'exit',
    'move_inside', 'any', 'nevermatch'];
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
export class EventSpec {
    constructor(evtTyp, regionName) {
        this._evtType = evtTyp;
        this._regionName = regionName;
        this._region = undefined; // will be bound once full FSM is provided
    }
    // Construct an EventSpec from an EventSpec_json object, checking all the parts 
    // (since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we think/hope it is).
    static fromJson(evt) {
        const evtType = Check.limitedString(evt.evtType, evtTypeStrings, "nevermatch", "EventSpec.fromJson{evtType:}");
        const region = Check.stringVal(evt.region, "EvtType.fromJson{region:}");
        return new EventSpec(evtType, region);
    }
    get evtType() { return this._evtType; }
    get regionName() { return this._regionName; }
    get region() { return this._region; }
    //-------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------- 
    // Attempt to find the Region object corresponding to our named region within
    // the given list of regions, and assign that to this._region.  If the region
    // name is "*" or the region is not found, _region is set to undefined.
    bindRegion(regionList) {
        // look for the wildcard
        if (this._regionName === "*") {
            this._region = undefined;
            return;
        }
        // **** YOUR CODE HERE ****
        // loop through our list of regions, if our name matches a region's name, set it and we're done.
        for (let reg of regionList) {
            if (this._regionName === reg.name) {
                this._region = reg;
                return;
            }
        }
        // we didn't match any region, that's ok for some forms that don't need a region
        if (this.evtType === 'nevermatch')
            return;
        if ((this.evtType === 'release_none' || this.evtType === 'any') &&
            this._regionName === "") {
            return;
        }
        Err.emit(`Region '${this._regionName}'` +
            ' in event specification does not match any region.');
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to perform a match against an actual event.  The event is represented 
    // by an event type (evtType) and an optional associated region (regn).  If 
    // our region is undefined and region name is "*", we will match to any region.
    match(evtType, regn) {
        // **** YOUR CODE HERE ****
        // Bail out if this event is a never match
        if (this.evtType === 'nevermatch')
            return false;
        // We'll define booleans for region and event match to update as we check different criteria
        let regMatch = true;
        let evtMatch = true;
        // For region match: check if we should be checking the given regn against our own, 3 things need to be satisfied: 
        //    1. Our region needs to be defined
        //    2. Our region needs to have a name other than "*"
        //    3. regn needs to be defined
        if (this.region && this.regionName !== "*" && regn) {
            // then check if this.region and regn are the same
            regMatch = this.region === regn;
        }
        // For event match: just make sure their evtTypes are the same if we aren't type any.
        if (this.evtType !== "any")
            evtMatch = this.evtType === evtType;
        return regMatch && evtMatch;
    }
    //-------------------------------------------------------------------
    // Debugging Support
    //-------------------------------------------------------------------
    // Create a short human readable string representing this object for debugging
    debugTag() {
        return `EventSpec(${this.evtType} ${this.regionName})`;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a human readable string displaying this object for debugging purposes
    debugString(indent = 0) {
        let result = "";
        const indentStr = '  '; // two spaces per indent level
        // produce the indent
        for (let i = 0; i < indent; i++)
            result += indentStr;
        result += `${this.evtType} ${this.regionName}`;
        if (!this.region)
            result += " unbound";
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Log a human readable display of this object to the console
    dump() {
        console.log(this.debugString());
    }
} // end class EventSpec 
//===================================================================
//# sourceMappingURL=EventSpec.js.map