const clientSuccessAuth      = localStorage.getItem('auth');
const clientSuccessBasicPath = 'https://app.clientsuccess.com/api/';
let currentClientContacts    = [];
let topBarInjected = false;

async function getClientSuccess(path){
	const results = await $.ajax({
		url: clientSuccessBasicPath + path,
		type: 'GET',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + clientSuccessAuth);
		},
		data: {},
	});

	return results;
}

// add a placeholder loading indicator for Contract Value
var topBarInjector = setInterval(function(){
	if($('.disp-pre-body').find('table tr').length > 0){
		clearInterval(topBarInjector);
		$('.disp-pre-body').find('table tr').append('<td class="details-data details-data-indented"><ul><li><span class="title" style="width: 102px">Contract Value</span><span class="detail" id="contract-value-value">Loading...</span></li></ul></td>');
		topBarInjected = true;
	}
}, 300);


var contactContainerListener = setInterval(async function(){
    if($('.contact-item').length > 0 && $('.all-contacts').not('.support-tool-patched').length > 0){
    	$('.all-contacts').not('.support-tool-patched').addClass('support-tool-patched');
        console.log('Contacts loaded!');
        // get the client ID
        var currentURL = window.location.pathname.split('/');
        if(currentURL[1] == 'cs' && currentURL[2] == 'success' && !isNaN(parseInt(currentURL[3]))){
        	// we have our Client ID
        	const clientID = currentURL[3];
        	// grab the client contacts
	        var contacts = await getClientSuccess('api/client/' + clientID + '/contact');
	        // loop through the contacts from the client and get their details
	        for(i = 0; i < contacts.length; i++){
	        	const contactDetails = await getClientSuccess('api/client/' + clientID + '/contact/' + contacts[i].id + '/detail');
	        	// store contact details (attribtues we care about) in final array for easy parsing later (key on name)
	        	currentClientContacts.push([contacts[i].name, contactDetails]);
	        }
	        // append custom attributes to the contact module
	        console.log('Done gathering contact details.');
	        console.log('Appending to contacts module!');
	        $('.contact-item').each(function(){
				// loop through the found details array to find the approprate user detail object
				for(i = 0; i < currentClientContacts.length; i++){
					if($(this).find('span').first().text() == currentClientContacts[i][0]){
						// append the account role to their name
						$(this).find('span').first().text(currentClientContacts[i][0] + ' - ' + currentClientContacts[i][1].customFieldValues[1].value)
					}
				}
			});
        } else {
        	console.log('ClientSuccess Extension Failing ERR 1');
        }
    }
}, 1000);

var clientCustomFieldListener = setInterval(function(){
	console.log('Checking custom...');
	if($('.custom-fields-app').find( "label:contains('Contract Value')" ).length > 0 && topBarInjected === true){
		console.log('Injecting custom');
		$('#contract-value-value').text($('.custom-fields-app').find( "label:contains('Contract Value')" ).parent().find('.content-editable').text());
	}
}, 1000);

// fix for overlapping SuccessCycle headers
var successCycleHeaderFix = setInterval(function(){
	if($('.stage-navigator').length > 0 && $('.stage-navigator__next').length > 0 && $('.stage-navigator__prev').length > 0){
		$('.stage-navigator').height('28px');
		$('.stage-navigator__next').css('padding-top', '14px');
		$('.stage-navigator__prev').css('padding-top', '14px');
	}
}, 300);

// Expired Account Banner
var clientTypeExpiredChecker = setInterval(function(){
	if($('li[ng-if="SuccessPageCtrl.client.clientSegmentId"]').length > 0) {
		if($('li[ng-if="SuccessPageCtrl.client.clientSegmentId"]').find('.detail').text() == "Expired"){
			if($('#expired-client-container').length == 0){
				$('div[ng-if="!SuccessPageCtrl.loading"]').prepend('<div id="expired-client-container" style="width: 100%; background-color: red; color: white; padding: 8px; font-size: 24px" align="center">EXPIRED CLIENT</div>');	
			}
		}
	}
}, 300);