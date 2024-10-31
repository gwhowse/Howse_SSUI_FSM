//===================================================================
// Finite State Machine driven interactor v1.0a 10/2023
// by Scott Hudson, CMU HCII 
//
// This and accompanying files provides classes and types which implement a generic
// interactor whose appearance and behavior is controlled by a Finite State Machine (FSM), 
// along with a set of "regions" which determine its appearance, as well as how 
// high-level input events for it are synthized and dispatched. See the comments
// in various classes for details.
//
// Revision history
// v1.0a  Initial version                 Scott Hudson  10/23
//
//===================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FSM } from "./FSM.js";
import { Err } from "./Err.js";
//===================================================================
// Class for an interactive object controlled by a finite state machine (FSM).
// Objects of this class have a position on the screen (the location of their top-left
// corner within the HTML canvas object associated with thier parent (Root) object), 
// Along with an FSM object which specifies, and partially imlements, their behavior.
// This class is repsonsible for using the FSM object to draw all the current region 
// images within the FSM, and for dispatching events to the FSM to drive its behavior.
// Note that this object has a position, but not an explicit size, and that no clipping
// of its output is being done.  Regions within the FSM are positioned in the coordinate
// system of this object (i.e., WRT its top-left corner), and have a size that 
// establishes a bouding box for input purposes (i.e., indicateing which event positions 
// are considered "inside" or "over" the region for input purposes).  However, region 
// image displays are not not limited to that bounding box and are not clipped (except 
// by the containing HTML canvas object).  See the FSM and Root classes for more details.
//=================================================================== 
export class FSMInteractor {
    constructor(fsm = undefined, x = 0, y = 0, parent) {
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // **** YOUR CODE HERE ****   
        // You will need some persistent bookkeeping for dispatchRawEvent()
        // Let's keep track of the old list of regions that were involved in our last event (reverse drawing order)
        this._picklist = [];
        this._fsm = fsm;
        this._x = x;
        this._y = y;
        this._parent = parent;
        if (fsm)
            fsm.parent = this;
    }
    get x() { return this._x; }
    set x(v) {
        // **** YOUR CODE HERE ****
        // If we have a new value, set it and declare damage
        if (v !== this._x) {
            this._x = v;
            this.damage();
        }
    }
    get y() { return this._y; }
    set y(v) {
        // **** YOUR CODE HERE ****
        // If we have a new value, set it and declare damage
        if (v !== this._y) {
            this._y = v;
            this.damage();
        }
    }
    // Position treated as a single value
    get position() {
        return { x: this.x, y: this.y };
    }
    set position(v) {
        var _a;
        if ((v.x !== this._x) || (v.y !== this._y)) {
            this._x = v.x;
            this._y = v.y;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage;
        }
    }
    get parent() { return this._parent; }
    set parent(v) {
        // **** YOUR CODE HERE ****
        // If we have a new value, set it and declare damage before and after
        if (v !== this._parent) {
            this.damage();
            this._parent = v;
            this.damage();
        }
    }
    get fsm() { return this._fsm; }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Declare that something managed by this object (most typically a region image, 
    // position, or size within the underlying FSM) has changed in a way that may 
    // make the current display incorrect and in need of update.  This is normally called 
    // from the controlling FSM, in response to damage declarations from its  "child" 
    // regions, etc.  This method passes the damage notification to its hosting Root
    // object which coordinates eventual redraw by calling this object's draw() method.
    damage() {
        var _a;
        // **** YOUR CODE HERE ****
        // pass damage up to parent if we have one
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage();
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Draw the display for this object using the given drawing context object.  If the
    // showDegugging parameter is passed as true, additional drawing for debugging 
    // purposes (e.g., a black frame showing the bounding box of every region) is 
    // requsted.  See Region.draw() for more details.
    draw(ctx, showDebugging = false) {
        // bail out if we don't have an FSM to work from
        if (!this.fsm)
            return;
        // **** YOUR CODE HERE **** 
        this.fsm.regions.forEach(function (region) {
            ctx.save();
            // move to our local coordinates and draw
            ctx.translate(region.x, region.y);
            region.draw(ctx, true);
            // then move back!
            ctx.restore();
        });
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Perform a "pick" operation, to determine the list of regions in our controlling
    // FSM which the given point is to be considered "inside" of or "over" (i.e., that
    // the given point is within the bounding box of).  The position passed here must 
    // be in the local coordinate system of this object (i.e., the position 0,0 would 
    // be at the top-left of this object).  Note that the "pick list" returned here
    // is ordered in reverse regions drawing order (regions drawn later, appear
    // earlier in the list) so that the region drawn on top of other objects appear
    // before them in the list.
    pick(localX, localY) {
        let pickList = [];
        // if we have no FSM, there is nothing to pick
        if (!this.fsm)
            return pickList;
        // **** YOUR CODE HERE ****
        // Ask each of the regions if (localX, localY) is inside. If yes, push on beginning of list
        // so that our picklist is in reverse drawing order
        for (let reg of this.fsm.regions) {
            // Translate our coords to region's coordinate system by subtracting off reg x and y
            let regionX = localX - reg.x;
            let regionY = localY - reg.y;
            // Then, if region coords get picked, add region to picklist
            if (reg.pick(regionX, regionY))
                pickList.unshift(reg);
        }
        return pickList;
    }
    // Dispatch the given "raw" event by translating it into a series of higher-level
    // events which are formulated in terms of the regions of our FSM.  "Raw" events 
    // are based on simple actions with the input device(s) -- currently just press and
    // release of the first/primary locator button, and locator moves.  "Raw" events are 
    // represented by one of those three event types along with a position (in the local
    // coordinates of this object).  
    //
    // The following higher-level events are generated as translations of a "raw" event:
    // exit <region>, enter <region>, press <region>, move_inside <region>, 
    // release <region>, and release_none.  Multiple of these high level events can be 
    // generated from one "raw" event.  For example, an underlying move event can 
    // generate exit, enter, and move_inside events for multiple regions.  The order
    // of event delivery is to first deliver all exit events, then all enter events, etc.
    // in the order listed above.  Within each event type, events associated with the 
    // last drawn region should be dispatched first (i.e., events are delivered in 
    // reverse region drawing order). Note that all generated higher-level events
    // are dispatched to the FSM (via its actOnEvent() method).
    dispatchRawEvent(what, localX, localY) {
        // if we have no FSM, there is nothing to dispatch to
        if (this.fsm === undefined)
            return;
        // **** YOUR CODE HERE ****
        // Let's find our new picklist in reverse drawing order
        let newPicklist = this.pick(localX, localY);
        switch (what) {
            case 'press': {
                // Just find everyone who got pressed and dispatch a press event to them
                for (let reg of newPicklist) {
                    this.fsm.actOnEvent('press', reg);
                }
                break;
            }
            case 'release': {
                // If no one got picked, dispatch releaseNone event and we're done
                if (newPicklist.length === 0) {
                    this.fsm.actOnEvent('release_none');
                    break;
                }
                // Otherwise, just find everyone who got released and dispatch a release event to them
                for (let reg of newPicklist) {
                    this.fsm.actOnEvent('release', reg);
                }
                break;
            }
            case 'move': {
                // We'll keep a running list for each of our three options
                let exitList = [];
                let enterList = [];
                let moveInsideList = [];
                // First, find every region that we exited (in the old picklist, not in the new)
                for (let reg of this._picklist) {
                    // If we can't find this region in the new list, that means we exited it so we add it to our exit list
                    if (newPicklist.indexOf(reg) < 0) {
                        exitList.push(reg);
                    }
                }
                // Second, iterate over our new picklist and decide if the region was entered or we moved within it
                for (let reg of newPicklist) {
                    if (this._picklist.indexOf(reg) < 0) {
                        // if reg isn't in old picklist, that means we entered it
                        enterList.push(reg);
                    }
                    else {
                        // if reg is in old picklist, that means we moved within it
                        moveInsideList.push(reg);
                    }
                }
                // Lastly, we dispatch the move events in priority order: exit, enter, then movein
                for (let reg of exitList) {
                    this.fsm.actOnEvent('exit', reg);
                }
                for (let reg of enterList) {
                    this.fsm.actOnEvent('enter', reg);
                }
                for (let reg of moveInsideList) {
                    this.fsm.actOnEvent('move_inside', reg);
                }
                break;
            }
        }
        // update picklist for bookkeeping
        this._picklist = newPicklist;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to begin an asychnous load of a FSM_json object from a remotely loaded 
    // .json file.  This object is then transformed into an FSM object to control
    // this object.  This method starts the loading process and sets up follow-on 
    // (asynchonous) actions, but then immediately returns.  In the asynchronous follow-on
    // actios, if the loading fails, Err.emit() is called with an appropriate message, 
    // and this._fsm is set to undefined.  When/if loading completes, the data is 
    // unpacked into an FSM_json object which is in turn used by FSM.fromJson() to create 
    // an FSM object installed as our fsm property.  Finally we declare damage to our 
    // parent object to arrange for redraw with the newly installed FSM.
    startLoadFromJson(jsonLoc) {
        return __awaiter(this, void 0, void 0, function* () {
            // try to load the json text from the given location
            const response = yield fetch(jsonLoc);
            if (!response.ok) {
                Err.emit(`Load of FSM from "${jsonLoc}" failed`);
                this._fsm = undefined;
                return;
            }
            //  parse the json into an (alledged) FSM_json object
            const data = yield response.json();
            // validate and build an actual FSM object out of that
            this._fsm = FSM.fromJson(data, this);
            // we just changed everything, so declare damage
            this.damage();
        });
    }
} // end class FSMInteractor 
//===================================================================
//# sourceMappingURL=FSMInteractor.js.map