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

    angular
        .module('transfer-send')
        .config(routes);

    routes.$inject = ['$stateProvider', 'FULFILLMENT_RIGHTS', 'SHOW_TRANSFERS'];

    function routes($stateProvider, FULFILLMENT_RIGHTS, SHOW_TRANSFERS) {
        $stateProvider.state('openlmis.stockmanagement.transferSend', {
            url: '/transferSend?programId&facilityId&destinationId',
            label: 'transferSend.title',
            isOffline: false,
            priority: 46,
            showInNavigation: SHOW_TRANSFERS,
            accessRights: [FULFILLMENT_RIGHTS.SHIPMENTS_EDIT],
            views: {
                '@openlmis': {
                    controller: 'TransferSendController',
                    controllerAs: 'vm',
                    templateUrl: 'transfer-send/transfer-send.html'
                }
            },
            resolve: {
                user: function(authorizationService) {
                    return authorizationService.getUser();
                },
                programs: function(user, programService) {
                    return programService.getUserPrograms(user.user_id);
                },
                facilities: function(facilityFactory) {
                    return facilityFactory.getSupervisedFacilitiesBasedOnRights([
                        FULFILLMENT_RIGHTS.SHIPMENTS_EDIT
                    ]);
                },
                partners: function($stateParams, transferService) {
                    if (!$stateParams.programId || !$stateParams.facilityId) {
                        return [];
                    }
                    return transferService.getPartners($stateParams.facilityId, $stateParams.programId, 'SEND');
                }
            }
        });
    }
})();
