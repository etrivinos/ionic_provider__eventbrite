import { Http, Headers } from '@angular/http';
import { Injectable } from '@angular/core';

import { eventbriteConfig } from './eventbrite.config';

declare var localStorage;
declare var EBWidgets;

@Injectable()
export class EventbriteProvider {
	eventbriteLocalConfig : any = { pretty: true };

  constructor(public http: Http) {}

  /**
  * Get user info
  * @method getUser
  * @url https://www.eventbriteapi.com/v3/users/me/?token=
  * @return Promise
  */
  getUser() {
  	let endpoint = eventbriteConfig.path.api.user;
  	return this.sendRequest(endpoint);
  }

  /**
  * Get own events
  * @method getOwnEvents
  * @url https://www.eventbriteapi.com/v3/users/me/events/?token=
  * @return Promise
  */
  getOwnEvents(data: any = {}, configData: any = {}) {
  	let endpoint = eventbriteConfig.path.api.own_events;
  	let config: any = { ...this.eventbriteLocalConfig, ...configData };

  	return new Promise((resolve, reject) => {
  		this.sendRequest(endpoint)
      .then((response: any) => {
        let events = [];

        for(let i = 0; i < response.events.length; i++) {
        	let event = response.events[i];

        	if(config.pretty) { 
	        	let prettyEvent = {
	        		id:						event.id,
		        	capacity: 		event.capacity,
		        	name: 				event.name.html,
		        	description: 	event.description.html,
		        	summary: 			event.summary,
		        	logo: 				event.logo.original.url,
		        	start: 				event.start.local,
		        	end: 					event.end.local,
		        	status: 			event.status,
		        	url: 					event.url,
		        	venue_id: 		event.venue_id,
		        	category_id: 	event.category_id
	        	};

	        	response.events[i] = prettyEvent;
        	};
        }

        resolve(response);
      }, (error) => {
        reject(error);
      });
    });
  }

  /**
  * Get event info
  * @method getEventInfo
  * @url https://www.eventbriteapi.com/v3/events/62554979628/?expand=ticket_classes&token=
  * @description 
			{
				expand: [ ticket_classes || venue || category || ticket_availability ],
				status: [ live || draf || started || ended || canceled ],

			}
  * @return Promise
  */

  getEventInfo(eventId: any, params: any = { expand: 'ticket_classes', status: 'live' }) {
  	return new Promise((resolve, reject) => {
	  	let paramsData = this.serialize(params);

	  	let endpoint = [
	  		eventbriteConfig.path.api.events,
	  		eventId,
	  		'/',
	  		paramsData
			].join('');

  		this.sendRequest(endpoint)
	      .then(response => {
	        resolve(response);
	      }, (error) => {
	        reject(error);
	      });
    });
  }

  /**
  * Get all event info
  * @method getEventInfo
  * @url https://www.eventbriteapi.com/v3/events/62554979628/?expand=ticket_classes&status=live&token=
  * @description 
			{
				expand: [ ticket_classes || venue || category || ticket_availability ],
				status: [ live || draf || started || ended || canceled ],

			}
  * @return Promise
  */
  getAllEventInfo(eventId: any, params: any = { status: 'live' }) {
  	let event = null;

  	return new Promise((resolve, reject) => {
  		this.getEventInfo(eventId, { 
  			expand: '', 
  			status: params.status 
  		})
	  		.then((response: any) => {
	  			event = response;
	  			return this.getEventInfo(eventId, { 
	  				expand: 'ticket_classes', 
	  				status: params.status 
	  			});
	  		})
	  		.then((response: any) => {
	  			event.ticket_classes = response.ticket_classes;

	  			return this.getEventInfo(eventId, { 
	  				expand: 'venue', 
	  				status: params.status 
	  			});
	  		})
	  		.then((response: any) => {
	  			event.venue = response.venue;
	  			return this.getEventInfo(eventId, { 
	  				expand: 'category', 
	  				status: params.status 
	  			});
	  		})
	  		.then((response: any) => {
	  			event.category = response.category;
	  			return this.getEventInfo(eventId, { 
	  				expand: 'ticket_availability', 
	  				status: params.status 
	  			});
	  		})
	  		.then((response: any) => {
	  			event.ticket_availability = response.ticket_availability;
	  			resolve(event);
	  		})
	  		.catch(error => {
	  			reject(error);
	  		});
	  	});
  }

  /**
  * Send request to universe
  * @method sendRequestToUniverse
  * @return Promise
  */
  sendRequest(endpoint: string) {
    let headers = new Headers();
    headers.append('Authorization', ['Bearer ', eventbriteConfig.credentials.token].join(''));

    return new Promise((resolve, reject) => {
      this.http.get(
        [
          eventbriteConfig.path.base,
          endpoint
        ].join(''),
        { headers: headers }
      )
      .subscribe(response => {
        let resp = response.json();

        resolve(resp);
      }, (error) => {
        reject(error.json());
      });
    });
  }

  /**
  * Init EventBrite Checkout Popup
  * @method openEventBriteCheckoutPopup
  * @return Promise
  */
  openEventBriteCheckoutPopup(eventId: number, elementId: string = 'eventbrite-widget-popup') {
  	EBWidgets.createWidget({
      widgetType:             "checkout",
      eventId:                eventId,
      modal:                  true,
      modalTriggerElementId:  elementId,
      onOrderComplete: 				function() {
        alert("Order complete!");
      }
    });
  }

  /**
  * Init EventBrite Checkout Embeded
  * @method openEventBriteCheckoutEmbeded
  * @return Promise
  */
  openEventBriteCheckoutEmbeded(eventId: number, elementId: string = 'eventbrite-widget-embeded') {
    EBWidgets.createWidget({
	    widgetType: 						"checkout",
	    eventId: 								eventId,
	    iframeContainerId: 			elementId,
	    iframeContainerHeight: 	425,
	    onOrderComplete: 				function() {
        alert("Order complete!");
      }
	  });
  }

  /**
	 * Serializes the form element so it can be passed to the back end through the url.
	 * The objects properties are the keys and the objects values are the values.
	 * ex: { "a":1, "b":2, "c":3 } would look like ?a=1&b=2&c=3
	 * @param obj - Object to be url encoded
	 */
	serialize(data: any): string {
    let params : any = [];

    for (var key in data) {
	    if (data.hasOwnProperty(key)) {
	    	let keyValuePair = [key, data[key]].join('=');
	    	params.push(keyValuePair);
      }
    }
    params = params.join('&');

	  return params ? '?' + params + '' : '';
	}
}