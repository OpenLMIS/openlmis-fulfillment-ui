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

describe('TransferSendController', function() {

    beforeEach(function() {
        module('transfer-send', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$controller = $injector.get('$controller');
            this.$state = $injector.get('$state');
            this.FacilityDataBuilder = $injector.get('FacilityDataBuilder');
            this.ProgramDataBuilder = $injector.get('ProgramDataBuilder');
        });

        this.programs = [
            new this.ProgramDataBuilder().build(),
            new this.ProgramDataBuilder().build()
        ];
        this.facilities = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];
        this.partners = [
            new this.FacilityDataBuilder().build(),
            new this.FacilityDataBuilder().build()
        ];
        this.stateParams = {};

        spyOn(this.$state, 'go');

        this.initController = function() {
            this.vm = this.$controller('TransferSendController', {
                programs: this.programs,
                facilities: this.facilities,
                partners: this.partners,
                $stateParams: this.stateParams
            });
            this.vm.$onInit();
        };
    });

    describe('$onInit', function() {

        it('should preselect the only program and the only facility', function() {
            this.programs = [this.programs[0]];
            this.facilities = [this.facilities[0]];

            this.initController();

            expect(this.vm.program).toBe(this.programs[0]);
            expect(this.vm.facility).toBe(this.facilities[0]);
        });

        it('should load the partners of the only program and facility', function() {
            this.programs = [this.programs[0]];
            this.facilities = [this.facilities[0]];

            this.initController();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferSend', {
                programId: this.programs[0].id,
                facilityId: this.facilities[0].id,
                destinationId: null
            }, {
                reload: true
            });
        });

        it('should not reload once the program and facility are in the url', function() {
            this.programs = [this.programs[0]];
            this.facilities = [this.facilities[0]];
            this.stateParams.programId = this.programs[0].id;
            this.stateParams.facilityId = this.facilities[0].id;

            this.initController();

            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should not reload while a program or a facility is still to be chosen', function() {
            this.facilities = [this.facilities[0]];

            this.initController();

            expect(this.$state.go).not.toHaveBeenCalled();
        });

        it('should not preselect a program or a facility out of several', function() {
            this.initController();

            expect(this.vm.program).toBeUndefined();
            expect(this.vm.facility).toBeUndefined();
        });

        it('should select the program, facility and destination from the url', function() {
            this.stateParams.programId = this.programs[1].id;
            this.stateParams.facilityId = this.facilities[1].id;
            this.stateParams.destinationId = this.partners[1].id;

            this.initController();

            expect(this.vm.program).toBe(this.programs[1]);
            expect(this.vm.facility).toBe(this.facilities[1]);
            expect(this.vm.destination).toBe(this.partners[1]);
            expect(this.vm.partners).toBe(this.partners);
        });

        it('should report no partners once a program and a facility were searched', function() {
            this.stateParams.programId = this.programs[0].id;
            this.stateParams.facilityId = this.facilities[0].id;
            this.partners = [];

            this.initController();

            expect(this.vm.noPartners).toBe(true);
        });

        it('should not report no partners before a search', function() {
            this.partners = [];

            this.initController();

            expect(this.vm.noPartners).toBe(false);
        });
    });

    describe('search', function() {

        it('should reload the page with the selected program and facility', function() {
            this.stateParams.destinationId = this.partners[0].id;
            this.initController();
            this.vm.program = this.programs[1];
            this.vm.facility = this.facilities[1];

            this.vm.search();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferSend', {
                programId: this.programs[1].id,
                facilityId: this.facilities[1].id,
                destinationId: null
            }, {
                reload: true
            });
        });

        it('should not reload the page until both a program and a facility are selected', function() {
            this.initController();
            this.vm.program = this.programs[0];

            this.vm.search();

            expect(this.$state.go).not.toHaveBeenCalled();
        });
    });

    describe('proceed', function() {

        it('should open the product selection for the chosen destination', function() {
            this.initController();
            this.vm.program = this.programs[0];
            this.vm.facility = this.facilities[0];
            this.vm.destination = this.partners[1];

            this.vm.proceed();

            expect(this.$state.go).toHaveBeenCalledWith('openlmis.stockmanagement.transferSend.creation', {
                programId: this.programs[0].id,
                facilityId: this.facilities[0].id,
                destinationId: this.partners[1].id
            });
        });

        it('should do nothing without a destination', function() {
            this.initController();
            this.vm.program = this.programs[0];
            this.vm.facility = this.facilities[0];

            this.vm.proceed();

            expect(this.$state.go).not.toHaveBeenCalled();
        });
    });
});
