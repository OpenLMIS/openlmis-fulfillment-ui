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

describe('openlmis.stockmanagement.transferSend state', function() {

    beforeEach(function() {
        module('transfer-send', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.FULFILLMENT_RIGHTS = $injector.get('FULFILLMENT_RIGHTS');
            this.SHOW_TRANSFERS = $injector.get('SHOW_TRANSFERS');
            this.transferService = $injector.get('transferService');
            this.programService = $injector.get('programService');
            this.facilityFactory = $injector.get('facilityFactory');
        });

        this.state = this.$state.get('openlmis.stockmanagement.transferSend');
        this.creationState = this.$state.get('openlmis.stockmanagement.transferSend.creation');
        this.partners = [{
            id: 'partner-id',
            name: 'Partner'
        }];

        spyOn(this.transferService, 'getPartners').andReturn(this.$q.resolve(this.partners));
    });

    it('should keep the selection in the url', function() {
        expect(this.state.url).toEqual('/transferSend?programId&facilityId&destinationId');
    });

    it('should require SHIPMENTS_EDIT right', function() {
        expect(this.state.accessRights).toEqual([this.FULFILLMENT_RIGHTS.SHIPMENTS_EDIT]);
    });

    it('should be shown in navigation only when transfers are enabled', function() {
        expect(this.state.showInNavigation).toBe(this.SHOW_TRANSFERS);
    });

    it('should show the selection form', function() {
        expect(this.state.views['@openlmis'].controller).toEqual('TransferSendController');
        expect(this.state.views['@openlmis'].templateUrl).toEqual('transfer-send/transfer-send.html');
    });

    it('should not be available offline', function() {
        expect(this.state.isOffline).toBe(false);
    });

    it('should resolve the programs of the user', function() {
        var programs = [{
            id: 'program-id'
        }];
        spyOn(this.programService, 'getUserPrograms').andReturn(this.$q.resolve(programs));

        var result;
        this.state.resolve.programs({
            //eslint-disable-next-line camelcase
            user_id: 'user-id'
        }, this.programService).then(function(response) {
            result = response;
        });
        this.$rootScope.$apply();

        expect(result).toEqual(programs);
        expect(this.programService.getUserPrograms).toHaveBeenCalledWith('user-id');
    });

    it('should resolve the facilities the user can ship from', function() {
        var facilities = [{
            id: 'facility-id'
        }];
        this.facilityFactory.getSupervisedFacilitiesBasedOnRights = jasmine.createSpy()
            .andReturn(this.$q.resolve(facilities));

        var result;
        this.state.resolve.facilities(this.facilityFactory).then(function(response) {
            result = response;
        });
        this.$rootScope.$apply();

        expect(result).toEqual(facilities);
        expect(this.facilityFactory.getSupervisedFacilitiesBasedOnRights)
            .toHaveBeenCalledWith([this.FULFILLMENT_RIGHTS.SHIPMENTS_EDIT]);
    });

    it('should resolve no partners without a facility', function() {
        var result = this.state.resolve.partners({
            programId: 'program-id'
        }, this.transferService);

        expect(result).toEqual([]);
        expect(this.transferService.getPartners).not.toHaveBeenCalled();
    });

    it('should resolve no partners without a program', function() {
        var result = this.state.resolve.partners({
            facilityId: 'facility-id'
        }, this.transferService);

        expect(result).toEqual([]);
        expect(this.transferService.getPartners).not.toHaveBeenCalled();
    });

    it('should resolve the facilities the selected facility can send to', function() {
        var result;
        this.state.resolve.partners({
            programId: 'program-id',
            facilityId: 'facility-id'
        }, this.transferService).then(function(response) {
            result = response;
        });
        this.$rootScope.$apply();

        expect(result).toEqual(this.partners);
        expect(this.transferService.getPartners).toHaveBeenCalledWith('facility-id', 'program-id', 'SEND');
    });

    describe('creation', function() {

        beforeEach(function() {
            inject(function($injector) {
                this.existingStockOrderableGroupsFactory = $injector.get('existingStockOrderableGroupsFactory');
                this.moment = $injector.get('moment');
            });

            this.vaccine = {
                id: 'vaccine-id'
            };
            this.syringe = {
                id: 'syringe-id'
            };
            this.validLot = {
                id: 'valid-lot',
                expirationDate: this.moment().add(1, 'days')
                    .format('YYYY-MM-DD')
            };
            this.expiringTodayLot = {
                id: 'expiring-today-lot',
                expirationDate: this.moment().format('YYYY-MM-DD')
            };
            this.expiredLot = {
                id: 'expired-lot',
                expirationDate: this.moment().subtract(1, 'days')
                    .format('YYYY-MM-DD')
            };
        });

        it('should open under the selection with SHIPMENTS_EDIT right', function() {
            expect(this.creationState.url).toEqual('/creation');
            expect(this.creationState.accessRights).toEqual([this.FULFILLMENT_RIGHTS.SHIPMENTS_EDIT]);
            expect(this.creationState.isOffline).toBe(false);
            expect(this.creationState.views['@openlmis'].controller).toEqual('TransferSendCreationController');
            expect(this.creationState.views['@openlmis'].templateUrl)
                .toEqual('transfer-send/transfer-send-creation.html');
        });

        it('should resolve the selected program, facility and destination', function() {
            var stateParams = {
                programId: 'program-2',
                facilityId: 'facility-2',
                destinationId: 'partner-2'
            };

            expect(this.creationState.resolve.program([{
                id: 'program-1'
            }, {
                id: 'program-2'
            }], stateParams)).toEqual({
                id: 'program-2'
            });

            expect(this.creationState.resolve.facility([{
                id: 'facility-1'
            }, {
                id: 'facility-2'
            }], stateParams)).toEqual({
                id: 'facility-2'
            });

            expect(this.creationState.resolve.destination([{
                id: 'partner-1'
            }, {
                id: 'partner-2'
            }], stateParams)).toEqual({
                id: 'partner-2'
            });
        });

        it('should resolve the products in stock without expired lots', function() {
            var program = {
                    id: 'program-id'
                },
                facility = {
                    id: 'facility-id'
                },
                vaccineGroup = [{
                    orderable: this.vaccine,
                    lot: this.validLot
                }, {
                    orderable: this.vaccine,
                    lot: this.expiringTodayLot
                }, {
                    orderable: this.vaccine,
                    lot: this.expiredLot
                }],
                syringeGroup = [{
                    orderable: this.syringe,
                    lot: null
                }],
                expiredGroup = [{
                    orderable: {
                        id: 'expired-id'
                    },
                    lot: this.expiredLot
                }];
            spyOn(this.existingStockOrderableGroupsFactory, 'getGroupsWithNotZeroSoh')
                .andReturn(this.$q.resolve([vaccineGroup, syringeGroup, expiredGroup]));

            var result;
            this.creationState.resolve.orderableGroups(this.existingStockOrderableGroupsFactory, program, facility,
                this.moment).then(function(response) {
                result = response;
            });
            this.$rootScope.$apply();

            expect(this.existingStockOrderableGroupsFactory.getGroupsWithNotZeroSoh)
                .toHaveBeenCalledWith({}, program, facility);

            expect(result).toEqual([[vaccineGroup[0], vaccineGroup[1]], syringeGroup]);
        });
    });

});
