====================================================================================================
Add eventbrite checkout plugins to ionic

To add the EventBrite Checkout Plugin please follow the next steps. If you have any doubt 
pleaser email me to blackesh@gmail.com.

## Steps

====================================================================================================
1. Add the javascript library before the end of the body tag inside the index.html:

...
<body>
	...
	<!-- EventBrite Checkout Plugins --> 
  	<script src="https://www.eventbrite.com/static/widgets/eb_widgets.js"></script>
	...
</body>

====================================================================================================
2. Add the EventBrite Provider to the app.module.ts:

	...
	import { EventbriteProvider } from '../providers/interface/eventbrite/eventbrite';

	@NgModule({
  declarations: [
		...
		providers: [
		    ...
		    EventbriteProvider,
		    ...
		  ],
	  ...
  ]

====================================================================================================
 3. Add the button or container to the html page:

 	<button id="eventbrite-widget-popup" ion-button>Buy Tickets Popup</button>
 	<div id="eventbrite-widget-embeded">Buy Tickets Embeded</div>

====================================================================================================
 4. Add the EventBrite Provider to the ionic page:

 	...
 	import { EventbriteProvider } from '../../../providers/interface/eventbrite/eventbrite';
 	...

	 	constructor(
	 		...
	    private eventBriteProvider: EventbriteProvider
	    ...
		) {}
		...
		ionWillEnter() {
			this.eventBriteProvider.openEventBriteCheckoutEmbeded(eventId);
		}
		...