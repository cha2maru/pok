var jsonPath = './js/pok.json';
var jqXHR = $.getJSON(jsonPath);
var charaSelect;
var beforeStatus;

jqXHR.done(function(json) {
    charaSelect = new Vue({
        el: "body",
        created: function() {
            this.entry = this.getEntry(json);
            this.levels = this.getLevels();
            this.ranks = this.getRanks();
            this.types = this.getTypes();
            this.pointsR = this.getPointsR();
            this.points = this.getPoints();
            // this.inputRank = this.ranks[0].value;
            // this.inputType = this.types[0].value;
            // this.inputLevel = this.levels[0].value;
            // this.setBefore([50,50,50,50,50,50,50,50]);
            // this.setAfter([10,10,10,10,10,10,10,10]);
        },
        ready: function() {
            this.$set("inputRank", 5);
            this.$set("inputName", this.$get("names")[0].value);
            this.$set("inputType", this.$get("types")[0].value);
            this.$set("inputLevel", this.$get("levels")[0].value);

        },
        methods: {
            getOptionObject: function(v) {
                return {
                    text: v,
                    value: v
                };
            },
            getRanks: function() {
                var ranks = [];
                for (var i = 5; i > 0; i--) {
                    ranks.push(this.getOptionObject(i));
                }
                return ranks;
            },
            getEntry: function(json) {
                var entry = {
                    5: {},
                    4: {},
                    3: {},
                    2: {},
                    1: {}
                };
                for (var id in json) {
                    var target = {};
                    var rank = json[id].summary.rank;
                    var name = json[id].summary.name;
                    var job = json[id].summary.job1;
                    var obj = {
                        summary: json[id].summary,
                        status: json[id].status
                    };
                    if (!entry[rank][name]) entry[rank][name] = {};
                    entry[rank][name][job] = obj;
                }
                return entry;

            },
            getTypes: function() {
                var types = [];
                for (var i = 0; i < this.characterTypes.length; i++) {
                    types.push(this.getOptionObject(this.characterTypes[i]));
                }
                return types;

            },
            getLevels: function() {
                var levels = [];
                var rank = this.inputRank
                if (!rank) rank = 5;

                for (var i = this.$data.maxLevel[rank]; i > 0; i--) {
                    levels.push(this.getOptionObject(i));
                }
                return levels;
            },
            getPointsR: function() {
                var points = [];
                for (var i = this.$data.maxPoint; i >= 0; i--) {
                    points.push(this.getOptionObject(i));
                }
                return points;
            },
            getPoints: function() {
                var points = [];
                for (var i = 0; i <= this.$data.maxPoint; i++) {
                    points.push(this.getOptionObject(i));
                }
                return points;
            },
            calcStatus: function(before, after, level) {
                var target = {
                    before: parseInt(before),
                    after: parseInt(after),
                };
                target.ave = (target.before - target.after) / (parseInt(level) - 1);
                target.limit = (60 - parseInt(level)) * target.ave + target.before;
                target.limitbreak = (80 - parseInt(level)) * target.ave + target.before;
                return target;
            },
            setBefore: function(list) {
                this.beforehp = list[0];
                this.beforestr = list[1];
                this.beforemag = list[2];
                this.beforedef = list[3];
                this.beforemnd = list[4];
                this.beforespd = list[5];
                this.beforedex = list[6];
                this.beforelck = list[7];
            },
            setAfter: function(list) {
                this.afterhp = list[0];
                this.afterstr = list[1];
                this.aftermag = list[2];
                this.afterdef = list[3];
                this.aftermnd = list[4];
                this.afterspd = list[5];
                this.afterdex = list[6];
                this.afterlck = list[7];
            },
            getStatusTable: function() {
                var table = [];
                var last = {
                    label: "合計",
                    before: 0,
                    max: 0,
                    ave: 0,
                    limit: 0,
                    limitbreak: 0
                };
                this.status = this.getStatus();
                for (var i = 0; i < this.statusList.length; i++) {
                    var target = {};
                    for (var key in this.statusList[i]) {
                        target[key] = this.statusList[i][key]
                    }
                    table.push(target);
                }
                for (var i = 0; i < this.status.length; i++) {
                    for (var key in this.status[i]) {
                        table[i][key] = this.status[i][key]
                    }
                    last.before += table[i].before;
                    last.ave += table[i].ave;
                    last.limit += table[i].limit;
                    last.limitbreak += table[i].limitbreak;
                }
                for (var i = 0; i < this.initStatus.length; i++) {
                    for (var key in this.initStatus[i]) {
                        table[i][key] = this.initStatus[i][key]
                    }
                }
                for (var i = 0; i < this.maxStatus.length; i++) {
                    for (var key in this.maxStatus[i]) {
                        table[i][key] = this.maxStatus[i][key]
                    }
                    last.max += table[i].max;
                }
                table.push(last);
                return table;
            },
            getStatus: function() {
                var status = [];
                // if (!this.inputRank || !this.inputName || !this.inputJob || !this.inputType || !this.inputLevel) return status;

                // var character = this.entry[this.inputRank][this.inputName][this.inputJob].status;

                status.push(this.calcStatus(this.beforehp, this.afterhp, this.inputLevel));
                status.push(this.calcStatus(this.beforestr, this.afterstr, this.inputLevel));
                status.push(this.calcStatus(this.beforemag, this.aftermag, this.inputLevel));
                status.push(this.calcStatus(this.beforedef, this.afterdef, this.inputLevel));
                status.push(this.calcStatus(this.beforemnd, this.aftermnd, this.inputLevel));
                status.push(this.calcStatus(this.beforespd, this.afterspd, this.inputLevel));
                status.push(this.calcStatus(this.beforedex, this.afterlck, this.inputLevel));
                status.push(this.calcStatus(this.beforedex, this.afterlck, this.inputLevel));

                return status;
            },
            getInitStatus: function() {
                var list = [];
                var input = [];

                if (!this.characterStatus) {
                    return list;
                }

                var target = this.characterStatus[this.initType];
                for (var i = 0; i < this.statusList.length; i++) {
                    var obj = {};
                    obj.init = parseInt(target[this.statusList[i].label]);
                    list.push(obj);
                    input.push(obj.init);
                }
                this.setAfter(input);

                return list;
            },
            getCharacterStatus: function() {
                if (!this.inputName || !this.inputRank || !this.inputJob) {
                    return null;
                }
                return this.entry[this.inputRank][this.inputName][this.inputJob].status;
            },
            getMaxStatus: function() {
                var list = [];
                var input = [];

                if (!this.characterStatus || !this.inputType) {
                    return list;
                }

                var target = this.characterStatus[this.inputType];
                for (var i = 0; i < this.statusList.length; i++) {
                    var obj = {};
                    obj.max = parseInt(target[this.statusList[i].label]);
                    list.push(obj);
                    input.push(obj.max);
                }

                this.setBefore(input);
                return list;
            }
        },
        filters: {
            roundup: function(value, num) {
                if (isNaN(value)) return value;
                var target;
                if (num <= 0 || isNaN(num)) {
                    target = Math.round(parseFloat(value));
                }
                else {
                    target = Math.round(parseFloat(value) * (10 ^ num)) / (10 ^ num);
                }
                return target;
            }
        },
        computed: {
            names: function() {
                var rank = this.inputRank;
                var list = [];
                if (!rank) return list;

                for (var name in this.entry[rank]) {
                    list.push({
                        text: name,
                        value: name
                    });
                }

                return list;
            },
            jobs: function() {
                var rank = this.inputRank;
                var name = this.inputName;

                var list = [];
                if (!rank || !name) return list;

                for (var job in this.entry[rank][name]) {
                    list.push({
                        text: job,
                        value: job
                    });
                }
                // this.inputJob = list[0].value;

                return list;
            },
            statusTable: function() {
                if (this.inputRank && this.inputName && this.inputJob) {
                    this.characterStatus = this.getCharacterStatus();
                    this.initStatus = this.getInitStatus();
                }
                if (this.inputRank && this.inputName && this.inputJob && this.inputType) {
                    this.maxStatus = this.getMaxStatus();
                }
                this.status = this.getStatus();

                return this.getStatusTable();
            }
        },
        watch: {
            names: function() {
                var target = this.$get("names")[0].value;
                this.$set("inputName", target);
                console.log("name" + target);
            },
            jobs: function() {
                var target = this.$get("jobs")[0].value;
                this.$set("inputJob", target);
                console.log("job" + target);
            },
        },
        data: {
            initType: '初期値',
            characterTypes: ['王姫型', '命姫型', '攻姫型', '魔姫型', '守姫型', '匠姫型'],
            maxLevel: {
                5: 80,
                4: 70,
                3: 60,
                2: 50,
                1: 40
            },
            statusList: [{
                suffix: "hp",
                label: "HP"
            }, {
                suffix: "str",
                label: "力"
            }, {
                suffix: "mag",
                label: "魔"
            }, {
                suffix: "def",
                label: "守"
            }, {
                suffix: "mnd",
                label: "精"
            }, {
                suffix: "spd",
                label: "速"
            }, {
                suffix: "dex",
                label: "技"
            }, {
                suffix: "lck",
                label: "運"
            }],
            maxPoint: 200,
            statusArray: [200, 199]
        }
    });
});

function merge() {
    var args = Array.prototype.slice.call(arguments),
        len = args.length,
        ret = {},
        itm;
    for (var i = 0; i < len; i++) {
        var arg = args[i];
        for (itm in arg) {
            if (arg.hasOwnProperty(itm))
                ret[itm] = arg[itm];
        }
    }

    return ret;

}


console.log("done");
