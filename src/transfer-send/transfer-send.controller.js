/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name transfer-send.controller:TransferSendController
     *
     * @description
     * Selects the program and the facility the stock is sent to. The stock is always sent from the user's
     * home facility.
     */
    angular
        .module('transfer-send')
        .controller('TransferSendController', controller);

    controller.$inject = ['$state', '$stateParams', 'programs', 'facility', 'canSend', 'partners'];

    function controller($state, $stateParams, programs, facility, canSend, partners) {
        var vm = this;

        vm.$onInit = onInit;
        vm.search = search;
        vm.proceed = proceed;

        function onInit() {
            vm.programs = programs;
            vm.facility = facility;
            vm.canSend = canSend;
            vm.partners = partners;
            vm.program = findById(programs, $stateParams.programId) || getOnly(programs);
            vm.destination = findById(partners, $stateParams.destinationId);
            vm.noPartners = Boolean($stateParams.programId) && canSend && partners.length === 0;

            // a select with a single option is filled without a change event, so nothing else would load the partners
            if (!$stateParams.programId) {
                search();
            }
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendController
         * @name search
         *
         * @description
         * Reloads the page with the selected program, which loads the transfer partners of the home facility.
         */
        function search() {
            if (!vm.program || !vm.canSend) {
                return;
            }

            $state.go('openlmis.stockmanagement.transferSend', {
                programId: vm.program.id,
                destinationId: null
            }, {
                reload: true
            });
        }

        /**
         * @ngdoc method
         * @methodOf transfer-send.controller:TransferSendController
         * @name proceed
         *
         * @description
         * Opens the product and lot selection for the chosen destination.
         */
        function proceed() {
            if (!vm.program || !vm.destination) {
                return;
            }

            $state.go('openlmis.stockmanagement.transferSend.creation', {
                programId: vm.program.id,
                destinationId: vm.destination.id
            });
        }

        function findById(items, id) {
            return items.filter(function(item) {
                return item.id === id;
            })[0];
        }

        function getOnly(items) {
            return items.length === 1 ? items[0] : undefined;
        }
    }
})();
