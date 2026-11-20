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

describe('TransferRequestController', function() {

    beforeEach(function() {
        module('transfer-request', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$rootScope = $injector.get('$rootScope');
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.transferService = $injector.get('transferService');
            this.loadingModalService = $injector.get('loadingModalService');
        });

        this.programs = [{
            id: 'program-one',
            name: 'Program One'
        }, {
            id: 'program-two',
            name: 'Program Two'
        }];
        this.facility = {
            id: 'facility-id',
            name: 'Home'
        };
        this.partners = [{
            id: 'partner-one'
        }, {
            id: 'partner-two'
        }];
        this.stateParams = {};

        spyOn(this.$state, 'go');
        spyOn(this.loadingModalService, 'open');
        spyOn(this.loadingModalService, 'close');

        this.initController = function() {
            this.vm = this.$controller('TransferRequestController', {
                programs: this.programs,
                facility: this.facility,
                partners: this.partners,
                $stateParams: this.stateParams
            });
            this.vm.$onInit();
        };
    });

    describe('$onInit', function() {

        it('should request for the home facility', function() {
            this.initController();

            expect(this.vm.facility).toBe(this.facility);
        });

        it('should preselect and load the partners of the only program', function() {
            this.programs = [this.programs[0]];

            this.initController();

            expect(this.vm.program).toBe(this.programs[0]);
            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferRequest', {
                programId: 'program-one'
            }, {
                reload: true
            });
        });

        it('should not reload once the program is in the url', function() {
            this.programs = [this.programs[0]];
            this.stateParams.programId = 'program-one';

            this.initController();

            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should not preselect a program out of several', function() {
            this.initController();

            expect(this.vm.program).toBeUndefined();
            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should select the program from the url', function() {
            this.stateParams.programId = 'program-two';

            this.initController();

            expect(this.vm.program).toBe(this.programs[1]);
        });

        it('should preselect the only supplying facility', function() {
            this.partners = [this.partners[0]];

            this.initController();

            expect(this.vm.supplyingFacility).toBe(this.partners[0]);
        });

        it('should flag a program without partners', function() {
            this.stateParams.programId = 'program-one';
            this.partners = [];

            this.initController();

            expect(this.vm.noPartners).toBe(true);
        });

        it('should not flag missing partners before a program is selected', function() {
            this.partners = [];

            this.initController();

            expect(this.vm.noPartners).toBe(false);
        });
    });

    describe('create', function() {

        beforeEach(function() {
            this.stateParams.programId = 'program-one';
            this.initController();
            this.vm.supplyingFacility = this.partners[1];
        });

        it('should create the request and open it', function() {
            spyOn(this.transferService, 'createRequest').andReturn(this.$q.resolve({
                id: 'order-id'
            }));

            this.vm.create();
            this.$rootScope.$apply();

            expect(this.transferService.createRequest).toHaveBeenCalledWith({
                program: {
                    id: 'program-one'
                },
                requestingFacility: {
                    id: 'facility-id'
                },
                supplyingFacility: {
                    id: 'partner-two'
                },
                facility: {
                    id: 'facility-id'
                },
                orderLineItems: []
            });

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferRequest.table', {
                programId: 'program-one',
                orderId: 'order-id'
            });

            expect(this.loadingModalService.open).toHaveBeenCalled();
            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should stay on the form when the request cannot be created', function() {
            spyOn(this.transferService, 'createRequest').andReturn(this.$q.reject({
                status: 400
            }));

            this.vm.create();
            this.$rootScope.$apply();

            expect(this.$state.go).not.toHaveBeenCalled();
            expect(this.loadingModalService.close).toHaveBeenCalled();
        });

        it('should not create a request without a supplying facility', function() {
            spyOn(this.transferService, 'createRequest');
            this.vm.supplyingFacility = undefined;

            this.vm.create();

            expect(this.transferService.createRequest).not.toHaveBeenCalled();
        });
    });
});
