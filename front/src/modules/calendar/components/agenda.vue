<template>
	<div>
		<div class="agenda">
			<div class="agendaHeader">
				<b-navbar-nav>
					<b-nav-form class="nav">
						<li class="navDisplay">
							<b-button v-b-popover.hover="'Pour plus tard: ici on pourrait accéder à la vue d une journée'" variant="primary" type="submit" class="navNavigate__btn"><i class="material-icons">today</i></b-button>
							<b-button v-b-popover.hover="'Pour plus tard: ici on pourrait accéder à la vue d une semaine'" variant="primary" type="submit" class="navNavigate__btn" ><i class="material-icons">view_week</i></b-button>
							<b-button v-b-popover.hover="'Pour plus tard: ici on pourrait accéder à la vue d un mois'" variant="primary" type="submit" class="navNavigate__btn"><i class="material-icons">view_module</i></b-button>
							<!-- <b-button v-b-modal.TestmodalSeeAptDetails>test modal</b-button> -->
						</li>
						<li class="navNavigate">
							<b-button variant="primary" class="navNavigate__btn" type="submit" v-on:click="getPreviousDays()"><i class="material-icons">navigate_before</i></b-button>
							<span class="weekNumber">Semaine {{weekNumber}}</span>
							<b-button variant="primary" class="navNavigate__btn" type="submit" v-on:click="getNextDays()"><i class="material-icons">navigate_next</i></b-button>
						</li>
					</b-nav-form>
				</b-navbar-nav>
			</div>
			<div class="agendaBodyLeftPanel">
				<ul class="hour" v-for="(hour, index) in hourList" :key="index">
					<li class="hourli">{{hour}}</li>
				</ul>
			</div>
			<b-container class="agendaBody">
				<b-row class="agendaBodyDays">
					<b-col class="day" v-for="(day,index) in timeRangeToDisplay" :key="index">
						<p class="dayName">{{day | dateFormatDayName}}</p>
						<p class="dayNumber">{{day | dateFormatDayNumberAndMonth}}</p>
					</b-col>
				</b-row>
				<b-row class="agendaBodySlots">
					<b-col class="buttonSlots" v-for="(day,index) in timeRangeToDisplay" :key="index">
						<ul class="slotUl" v-for="(button, index) in btnIdToDisplay" v-if="buttonIdIsInDay(day,button)" :key="index">
							<li class="slotLi">
								<b-button v-on:click="getMatchingSlot(button,getSlots)" v-bind:class="classId[index]" v-bind:id="button" >
									<li class="slotLi__button_id">{{button.id | displayButtonId}}</li>
									<li class="aptinfo">{{button.aptFullName}}</li>
									<li id="type" class="aptinfo">{{button.aptType}}</li>
								</b-button>
							</li>
						</ul>
					</b-col>
				</b-row>
			</b-container>
		</div>


		<!-- Modal "Book an appointment" -->		
		<!-- the opening of this modal is triggered on clik on button, after buttonId has been parsed and if available = true, the method getRelevantModal is called -->
		<b-modal id="modalBookApt" ref="modalBookApt" centered title="Creer un nouveau rendez-vous" v-bind:hide-footer="hideFooter" v-bind:cancel-disabled="cancelDisabled" v-bind:ok-disabled="okDisabled">
			<form @submit.stop.prevent="bookApt">
				<p>Heure du RDV: {{matchingSlot.start | formatDayHour}}</p>
				<b-form-select v-model="formRDV.selectedTypeRDV" class="mb-3">
					<option value="" disabled>-- Sélectionnez un type de RDV --</option>
					<option v-for="eventType in getEventTypes"v-bind:value="eventType">{{eventType.name}}</option>
				</b-form-select>
				<p>Durée du RDV: {{formRDV.selectedTypeRDV.duration}} min</p>
				<label for="email">RDV avec:</label>
				<b-form-input type="email" placeholder="E-mail" v-model="formRDV.mailRDV"></b-form-input>
				<label for="commentaire">Commentaires:</label>
				<b-form-textarea type="text" placeholder="Pour l'instant les commentaires ne sont pas enregistrés en base de données, donc pas récupérés" v-model="formRDV.textRDV" :rows="6" :max-rows="6">
				</b-form-textarea>
				<b-button type="submit" v-on:click="" variant="primary">Submit</b-button>
				<b-button type="reset" v-on:click="clearModalBookApt()"
				variant="danger">Reset</b-button>
			</form>
		</b-modal>

		<!-- Modal "See appointment details" -->
		<!-- the opening of this modal is triggered on clik on button, after buttonId has been parsed and if available = false, the method getRelevantModal is called -->
		<b-modal id="modalSeeAptDetails" ref="modalSeeAptDetails"  centered title="Détails du rendez-vous" v-bind:hide-footer="hideFooter" v-bind:cancel-disabled="cancelDisabled" v-bind:ok-disabled="okDisabled">
			<b-form-group label-text-align @submit.stop.prevent="modifyApt">
					<!-- on mettra le jour et l'heure du RDV -->
					<!-- <b-form-input type="text" v-model="confirmedRDV.TypeRDV.initialSlot.start" required v-bind:disabled="detailRDVInputDisabled"></b-form-input> -->
					<h3 class="RDVdate"> le {{confirmedRDV.initialSlot.start | formatDayHour}}</h3>
					<!-- il faudra transformer initialSlot.start au bon format via une computed -->
				<label >Type de RDV</label>
					<b-form-input type="text" v-model="confirmedRDV.TypeRDV.name" required v-bind:disabled="detailRDVInputDisabled"></b-form-input>
						<b-form> 
					<label>Durée</label>
					<b-form-input type="text" v-model="confirmedRDV.TypeRDV.duration" required v-bind:disabled="detailRDVInputDisabled"></b-form-input>
				</b-form>
				<label>Nom</label>
				<b-form-input type="text" v-model="confirmedRDV.lastNameRDV" required v-bind:disabled="detailRDVInputDisabled"></b-form-input>
				<label>Prenom</label>
				<b-form-input type="text" v-model="confirmedRDV.firstNameRDV" required v-bind:disabled="detailRDVInputDisabled"></b-form-input>
				<label>Téléphone</label>
				<b-form-input type="text" v-model="confirmedRDV.phoneRDV" required v-bind:disabled="detailRDVInputDisabled"></b-form-input>
				<label>Mail</label>
				<b-form-input type="email" v-model="confirmedRDV.mailRDV" required v-bind:disabled="detailRDVInputDisabled"></b-form-input>
				<label>Commentaires</label>
				<b-form-textarea type="textarea" v-model="confirmedRDV.textRDV" required v-bind:disabled="detailRDVInputDisabled" :rows="6" :max-rows="6" placeholder="Pour l'instant les commentaires ne sont pas enregistrés en base de données, donc pas récupérés"></b-form-textarea>
				<b-button v-if="displaySeeAptDetailsBtn" type="button" v-on:click="closeModal()" variant="primary">OK</b-button>
				<b-button v-if="displaySeeAptDetailsBtn" type="button" v-on:click="validateComing()" variant="success">Valider présence</b-button>
				<b-button v-if="displaySeeAptDetailsBtn" type="button" v-on:click="changeDisabledAttribute()" variant="warning">Modifier le RDV</b-button>
				<b-button v-if="displaySeeAptDetailsBtn" type="button" v-on:click="cancelApt()" variant="danger">Annuler le RDV</b-button>
				<b-button v-if="displaySeeAptDetailsBtn_amend" type="button" v-on:click="amendApt()" variant="primary">Confirmer la modification du RDV</b-button>
			</b-form-group>
		</b-modal>

	
	</div>
</template>

<script>

/* eslint-disable */
import moment from 'moment';
import 'moment/locale/fr';
import { store } from '../../../store/store';
import * as cHelpers from '.././calendarHelpers';
import http from '../../../helpers/http';
import _ from 'underscore';
import swal from "sweetalert2";


//description of component
	//This component will display the conseiller agenda.
	// by default, 
	//the agenda is filled in with buttons with NonAvailable ids, for the next month
	// when the agenda get the 'available' or 'booked' slots from backend,
		//it will pass them to the store if no conflict
	//On click on some "available" button, a modal to create a RDV is opening

	//! WORK IN PROGRESS
	
	// TODO
	//on click on some "not available" button, give the ability to make it available ( same route as mass parametrage)
	//on click on some "booked" button, give the ability to see the full details of the appointment, and to cancel it: on the way!
	//display the name and type of appointment on the booked buttons: on the way!

	
export default {
	name: "agenda",
	computed:{
		getTimeRange(){
			return this.$store.state.agendaRangeTime;
		},
		endDisplay(){
			return cHelpers.limitDisplay('week', this.beginDisplay);
		},
		timeRangeToDisplay(){
			return this.getTimeRange.slice(this.beginDisplay, this.endDisplay)
		},
		getSlots(){
			return this.$store.state.agendaSlots;
		},
		week(){
			return cHelpers.getWeekNumber(this.$store.state.now);
		},
		btnIdToDisplay(){
			return this.filterButtonIdToDisplay(this.timeRangeToDisplay, this.buttonIdList);
		},
		classId(){
			return this.btnIdToDisplay.map(function(button){
				return button.class;
			});
		},
		getEventTypes(){
			return this.$store.state.eventTypes;
		}
	},
	data() {
		return {
		//calendar datas
			slots:[],
			appointmentTypes:{},
			minTimeRange:'',
      		hourList:['08:00','08:15','08:30','08:45','09:00','09:15', '09:30', '09:45',
      		'10:00','10:15','10:30','10:45','11:00','11:15','11:30','11:45','12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45', '15:00','15:15','15:30','15:45','16:00','16:15','16:30','16:45','17:00','17:15','17:30','17:45'],
      		day:'',
      		weekNumber:'',
      		beginDisplay:'',
      		// buttonId:'',
      		button:'',
      		buttonIdList:[],
      		filteredButtonIdList: [],
      		btnIdListToMerge: [],
      		matchingSlot:'',
      		eventType:{},
      	//modals datas
      		formRDV:{
      			selectedTypeRDV:'',
      			mailRDV:'',
      			textRDV:'',
      			initialSlot:'',
      			allSlots:[]
      		},
      		confirmedRDV:{
      			TypeRDV:'',
      			lastNameRDV:'',
      			firstNameRDV:'',
      			phoneRDV:'',
      			mailRDV:'',
      			textRDV:'',
      			initialSlot:'',
      			allSlots:[]
      		},
      	//display datas
      		detailRDVInputDisabled:true,
      		diplayedModal:'',
      		cancelDisabled:true,
      		okDisabled:true,
      		hideFooter:true,
      		displaySeeAptDetailsBtn_amend:false,
      		displaySeeAptDetailsBtn:true
      	}
	},
	created(){
		this.beginDisplay = 0;
		this.weekNumber = cHelpers.filterInt(this.week);
		this.callHttpGetCalendar();
	},
	methods: {
		commit : function(){
			if (this.slots){
				this.$store.commit('getSlotsAvailables', this.slots);
				this.$store.commit('getEventTypes',this.appointmentTypes);
				this.$store.commit('getMinTimeRange', this.minTimeRange);
			}
			else{
				this.$store.commit('getEventTypes',this.appointmentTypes);
				this.$store.commit('getMinTimeRange', this.minTimeRange);
				swal({
		            type: "info",
		            title: "Affichage de votre Agenda",
		            text: "Vous devez paramétrer des disponibilités pour voir votre agenda"
		        });
			}
		},
		setCalendar: function(){
			this.buttonIdList =[];
			this.filteredButtonIdList= [];
			this.createButtonId(this.getTimeRange);
			this.updateButtonId(this.getSlots, this.buttonIdList);
					},
		callHttpGetCalendar: function(){
			http.get('/calendar')
					.then(
						res => {
							// console.log('callHttpGetCalendar content: ', res);
							// console.log('res:',res.data.content);
							this.slots = res.data.content.slots;
							this.appointmentTypes = res.data.content.appointmentTypes;
							this.minTimeRange = cHelpers.GetMinTimeFromSlotsArray(res.data.content.slots);
							this.commit();
							this.setCalendar();
						})
					.catch(
						error => {
					    // console.log('error:', error.response.data.message);
					    swal({
			            type: "info",
			            title: "Affichage de votre agenda",
			            text: "Votre Agenda n'a pas pu se mettre à jour. Si vous y accédez pour la première fois, merci de paramétrer vos disponibilités et types de RDV"
			          	});
					});
		},
		createButtonId: function(timeRange){
			this.buttonIdList = [];
			//based on a timeRange of days, and based on the hours to display in agenda
			//this function create buttons with Id representatives of the date, hour.
			//by default, they also represent status N( Non available)
			let reg = /:/;
			for (let i=0; i<timeRange.length; i++){
				for(let j=0; j<this.hourList.length; j++){
					let id;
					id = moment(timeRange[i]).format('YYYY-MM-DD').toString()+ '-' + this.hourList[j]+ '-' +'N';
					id = id.replace(reg, '-');
					let button = {
						id: id,
						class:'N',
						// apt:'',
						aptFullName:'',
						aptType:'',
						aptId:'',
						aptDuration:''
					}
					this.buttonIdList.push(button);
				}
			}
			return this.buttonIdList;
		},
		updateButtonId: function(slots, idList){
			//this function will update ButtonID based on slots status, and modify the buttonsID accordingly
			for (let i=0; i<slots.length; i++){
				for (let j=0; j<idList.length; j++){
					let sl = moment(slots[i].start).format('YYYY-MM-DD-HH-mm').toString();
					let id = idList[j].id.slice(0,16);
					if (sl == id) {
						if(slots[i].available === true){
							idList[j].id = idList[j].id.slice(0,16)+'-'+'A';
							idList[j].class = 'A';
						}
						if(slots[i].available === false){
							idList[j].id = idList[j].id.slice(0,16)+'-'+'B';
							idList[j].aptId = slots[i].appointment.appointmentId._id;
							idList[j].aptDuration = slots[i].appointment.appointmentId.appointmentType.duration;
							idList[j].aptFullName = slots[i].appointment.fullName;
							idList[j].aptType = slots[i].appointment.appointmentId.appointmentType.name;
							if (idList[j].aptDuration == '15'){idList[j].class = 'a' +'B'}
							if (idList[j].aptDuration == '30'){idList[j].class = 'b' +'B'}
							if (idList[j].aptDuration == '45'){idList[j].class = 'c' +'B'}
							if (idList[j].aptDuration == '60'){idList[j].class = 'd' +'B'}
							if (idList[j].aptDuration == '75'){idList[j].class = 'e' +'B'}
							if (idList[j].aptDuration == '90'){idList[j].class = 'f' +'B'}
						}
					}
				}
			}
			console.log('les boutons ont bien été updatés avec les slots');
			console.log('buttonIdList:', this.buttonIdList);
			this.cleanButtonId(this.buttonIdList);
			this.cleanButtonId(this.buttonIdList);
			return this.buttonIdList;
		},
		cleanButtonId:function(btnIdListToCheck){
			for (let i=0; i<btnIdListToCheck.length; i++){
				if(btnIdListToCheck[i].id.charAt(btnIdListToCheck[i].id.length - 1) == 'B'){
					if (btnIdListToCheck[i].aptId == btnIdListToCheck[i+1].aptId){
					// on va lui dire d'enlever le i+1//
					//il n'en  restera que 2 identiques, le premier et le dernier.
					// on relancera la fonction pour supprimer le dernier.
					// Oui je sais c'est dégueulasse comme code :)
					//pour l'urgence ça ira bien
					btnIdListToCheck.splice(i+1,1);
					console.log('btnIdListToCheck:', btnIdListToCheck)
					}
				}
			}
		},
		filterButtonIdToDisplay: function(timeRange, btnIdList){
			for (let i=0; i<timeRange.length; i++){
				let trday
				trday = moment(timeRange[i]).format('YYYY-MM-DD').toString();
				for (let j=0; j<btnIdList.length; j++){
					let btnid = btnIdList[j].id.slice(0,10);
					if (trday == btnid){
						this.filteredButtonIdList.push(btnIdList[j]);
					}
				}
			}
			console.log('this.filteredButtonIdList:', this.filteredButtonIdList)
			return this.filteredButtonIdList;
		},
		buttonIdIsInDay: function(day,btn){
			// this is a conditional function, called in V-for to display under the day only the button with ID matching the day
			let a = moment(day).format('YYYY-MM-DD').toString();
			let b = btn.id.slice(0,10);
			if(a == b) {
				return true;
			}
		},
		getNextDays: function(){
			this.beginDisplay += 7;
			this.weekNumber +=1;
			this.filteredButtonIdList = [];
		},
		getPreviousDays: function(){
			if (this.beginDisplay>=7){
				this.beginDisplay -= 7;
				this.weekNumber -=1;
				this.filteredButtonIdList = [];
			}
		},
		getMatchingSlot: function(btn, slots){
			console.log('j actionne le buttonId', btn);
				for (let i=0; i<slots.length; i++){
					let sl = moment(slots[i].start).format('YYYY-MM-DD-HH-mm').toString();
					let id = btn.id.slice(0,16);
					if (sl == id){
						this.matchingSlot = slots[i];
						console.log('the matching slot is:', this.matchingSlot);
						this.getRelevantModal(btn);
					}
					else {
						console.log('no matching slot');
						//si aucun matching slot n'est trouvé, 
						//c'est que le boutton est en N
						//alors on peut lui proposer de passer en A
					}
				}
		},
		getRelevantModal:function(btn){
			if (btn.id.charAt(btn.id.length - 1) == 'A'){
							this.$refs.modalBookApt.show();
							this.displayedModal = this.$refs.modalBookApt;
							//si le bouton est A, 
							// je propose:
							//de prendre RDV: OK
			}
			if (btn.id.charAt(btn.id.length - 1) == 'B'){
							this.$refs.modalSeeAptDetails.show();
							this.displayedModal = this.$refs.modalSeeAptDetails;
							this.getApt();
							//si le bouton est en B, je propose:
							//- voir les détails du RDV : OK
							//- Annuler le RDV: A finaliser
							//- Confirmer la présence du RDV et l'archiver?
							//- Modifier le RDV
						}
		},
		getSlotsInRange: function(slotList,start,end){
			for (let i=0; i<slotList.length; i++){
				if (moment(slotList[i].start).isBetween(start, end, null, '[)')){
					this.formRDV.allSlots.push(slotList[i]);
				}
			}
		},
		bookApt(){
			//from the initial slot selected and the duration of the meeting, i create a time range and i check wich slots is belonging to this time range.
			this.formRDV.allSlots=[];
			this.formRDV.initialSlot = this.matchingSlot;
			let startRDV = moment(this.formRDV.initialSlot.start);
			let endRDV = moment(startRDV).add(this.formRDV.selectedTypeRDV.duration, 'minutes');
			this.getSlotsInRange(this.getSlots,startRDV,endRDV);
			let postBody = {
			  mailClient: this.formRDV.mailRDV,
			  slotsId: _.pluck(this.formRDV.allSlots, '_id'),
			  appointmentType: this.formRDV.selectedTypeRDV, // Modif 2 Luke
			  description: this.formRDV.textRDV
			}
			console.log('postBody: ', postBody);
			this.displayedModal.hide();
			
			http.post('/calendar/appointment', postBody)
					.then(
						res => {
						console.log('res:',res);
						swal({
			            type: "success",
			            title: "creation du RDV: ",
			            text: "Votre RDV a bien été crée: OK! Merci de patienter pendant la mise à jour de votre agenda:) "
			          	});
			          	this.callHttpGetCalendar();
						// when redirected to agenda, a new http.get/calendar will be done, which will update the slots.
						//le probleme c'est qui est déjà sur la page agenda
						})
					.catch(
						error => {
					    console.log('error:', error.response);
					    swal({
			            type: "error",
			            title: "ECHEC de la creation du RDV: ",
			            text: error.response.data.message
			          	});
					});
		},
		getApt(){
			//je dois récupérer le slot correspondant et passer l'Id du slot au back
			this.confirmedRDV.initialSlot = this.matchingSlot;
			console.log('this.confirmedRDV.initialSlot: ', this.confirmedRDV.initialSlot._id);
			http.get("/calendar/appointment/" + this.confirmedRDV.initialSlot._id)
					.then(
						res => {
							console.log('res:', res);
						this.confirmedRDV.TypeRDV = res.data.content.appointmentType;
						this.confirmedRDV.lastNameRDV = res.data.content.participants.clients.lastName;
						this.confirmedRDV.firstNameRDV = res.data.content.participants.clients.firstName;
						this.confirmedRDV.phoneRDV = res.data.content.participants.clients.phone;
						this.confirmedRDV.mailRDV = res.data.content.participants.clients.email;
						// this.confirmedRDV.textRDV = res.data.content.participants.clients.x;
						this.confirmedRDV.allSlots = res.data.content.slots;
						this.confirmedRDV.TypeRDV.initialSlot = res.data.content.slots[0].start;
						})
					.catch(
						error => {
					    // console.log('error:', error.response.data.message);
					    swal({
			            type: "error",
			            title: "Détail du RDV",
			            text: "Les informations du RDV n'ont pas pu être récupérées"
			          	});
					});
		},
		amendApt(){
			console.log('je souhaite modifier le RDV');
			this.changeDisabledAttribute();
			let postBody = this.formRDV;
			console.log('postBody:', postBody);
			http.put("/calendar/appointment/" + this.confirmedRDV.initialSlot._id, postBody)
					.then(
						res => {
						console.log('res:',res);
						this.closeModal();
						})
					.catch(
						error => {
					    console.log('error:', error.response.data.message);
					    swal({
			            type: "error",
			            title: "modification du RDV",
			            text: "La route n'est pas encore opérationnelle"
			          	});
					});
		},
		cancelApt(){
			console.log('je souhaite annuler le RDV');
			http.delete("/calendar/appointment/" + this.confirmedRDV.initialSlot._id)
					.then(
						res => {
						console.log('res:',res);
						this.closeModal();
						})
					.catch(
						error => {
					    console.log('error:', error.response.data.message);
					    swal({
			            type: "error",
			            title: "Annulation du RDV",
			            text: "La route n'est pas encore opérationnelle"
			          	});
					});
		},
		setToNonAvailable(){
			console.log('je veux me rendre indisponible');
		},
		clearModalBookApt(){
			this.formRDV.selectedTypeRDV = '';
			this.formRDV.mailRDV = '';
			this.formRDV.textRDV = '';
		},
		closeModal(){
			this.displayedModal.hide();
		},
		validateComing(){
			//we could imagine here a function that would give a status to the appointment "terminé" and would trigger a notification to the conseiller that the personn has reached the meeting place
			swal({
	            type: "success",
	            title: "Votre RDV est arrivé",
	            text: "en validant la présence, le conseiller serait notifié de la venue du client"
	         });
			this.closeModal();
		},
		changeDisabledAttribute(){
			this.detailRDVInputDisabled = !this.detailRDVInputDisabled;
			this.displaySeeAptDetailsBtn_amend = !this.displaySeeAptDetailsBtn_amend;
			this.displaySeeAptDetailsBtn = !this.displaySeeAptDetailsBtn;
		}
	},
	filters: {
		dateFormatFull: function(date) {
			return moment(date).format('DD/MM/YYYY');
		},
		dateFormatYear: function(date) {
			return moment(date).format('YYYY');
		},
		dateFormatDayName: function(date) {
			return moment(date).format('dddd');
		},
		dateFormatDayNumberAndMonth: function(date) {
			return moment(date).format('D MMM');
		},
		formatTime: function(date) {
			return moment(date).format('LT');
		},
		formatDayHour: function(date) {
			return moment(date).format('lll');
		},
		displayButtonId: function(id){
			return id.slice(11,16);
		}
	}

};
</script>

<style scoped>


</style>