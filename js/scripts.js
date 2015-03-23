var jsonPath = './js/pok.json';
var jqXHR = $.getJSON(jsonPath);
var charaSelect;
var beforeStatus;

charaSelect = new Vue({
    el: "body",
    created: function() {
        this.$set("entry", this.getEntry(data));
        this.$set("levels", this.getLevels());
        this.$set("ranks", this.getRanks());
        this.$set("types", this.getTypes());
        this.$set("pointsR", this.getPointsR());
        this.$set("points", this.getPoints());
    },
    ready: function() {
        this.$set("inputRank", 5);
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
                before: before,
                after: after,
            };
            target.ave = (target.before - target.after) / (level - 1);
            target.limit = (60 - level) * target.ave + target.before;
            target.limitbreak = (80 - level) * target.ave + target.before;
            return target;
        },
        setInputStatus: function(target) {
            console.log("setInputStatus");
            console.log(target);
            for (var key in target.before) {
                if (target.before[key] < 0) {
                    target.before[key] = 0;
                }
            }
            for (var key in target.after) {
                if (target.after[key] < 0) {
                    target.after[key] = 0;
                }
            }
            console.log(target);

            if (target.before) {
                this.$set("before", target.before);
            }
            if (target.after) {
                this.$set("after", target.after);
            }
        },
    },
    filters: {
        roundup: function(value, num) {
            if (isNaN(value)) return value;
            var target;
            if (num <= 0 || isNaN(num)) {
                target = Math.round(value);
            }
            else {
                target = Math.round(value * (10 ^ num)) / (10 ^ num);
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
            console.log("statusTable");

            var _character = this.$get("input_character");
            var _status = this.$get("input_status");


            _status.before.attack = _status.before.str + _character.equip.dmg;
            _status.before.deffence = _status.before.def + _character.equip.def;
            _status.before.mind = _status.before.mnd + _character.equip.mdef;
            _status.before.magic = _status.before.mag + _character.equip.mdmg;
            _status.before.hit = _status.before.dex * 1.5 + _status.before.lck / 2 + _character.equip.hit;
            _status.before.dudge = _status.before.spd * 1.5 + _status.before.lck / 2;
            _status.before.critical = _status.before.dex * 0.5;


            _status.before.parameter = _status.before.hp + _status.before.deffence + _status.before.mind + _status.before.magic + _status.before.hit / 2 + _status.before.critical / 2 + _status.before.dudge / 2;
            _status.after.attack = _status.after.str + _character.equip.dmg;
            _status.after.deffence = _status.after.def + _character.equip.def;
            _status.after.mind = _status.after.mnd + _character.equip.mdef;
            _status.after.magic = _status.after.mag + _character.equip.mdmg;
            _status.after.hit = _status.after.dex * 1.5 + _status.after.lck / 2 + _character.equip.hit;
            _status.after.dudge = _status.after.spd * 1.5 + _status.after.lck / 2;
            _status.after.critical = _status.after.dex * 0.5;
            _status.after.parameter = _status.after.hp + _status.after.deffence + _status.after.mind + _status.after.magic + _status.after.hit / 2 + _status.after.critical / 2 + _status.after.dudge / 2;

            var table1 = [];
            var table2 = [];
            var last = {
                label: "合計",
                before: 0,
                after: 0,
                max: 0,
                ave: 0,
                limit: 0,
                limitbreak: 0
            };

            for (var i = 0; i < this.statusTableIdx1.length; i++) {
                var target = {};
                target.label = this.statusTableIdx1[i].label;
                target.before = _status.before[this.statusTableIdx1[i].suffix];
                target.after = _status.after[this.statusTableIdx1[i].suffix];
                target.max = _character.max[this.statusTableIdx1[i].suffix];
                last.before += target.before;
                last.after += target.after;
                last.max += target.max;
                if (_character.level) {
                    target.ave = (target.before - target.after) / (_character.level - 1);
                    target.limit = target.ave * (60 - _character.level) + target.before;
                    target.limitbreak = target.ave * (80 - _character.level) + target.before;
                    last.ave += target.ave;
                    last.limit += target.limit;
                    last.limitbreak += target.limitbreak;
                }
                table1.push(target);
            }
            table1.push(last);

            for (var i = 0; i < this.statusTableIdx2.length; i++) {
                var target = {};
                target.label = this.statusTableIdx2[i].label;
                target.before = _status.before[this.statusTableIdx2[i].suffix];
                target.after = _status.after[this.statusTableIdx2[i].suffix];
                target.max = _character.max[this.statusTableIdx2[i].suffix];
                if (_character.level) {
                    target.ave = (target.before - target.after) / (_character.level - 1);
                    target.limit = target.ave * (60 - _character.level) + target.before;
                    target.limitbreak = target.ave * (80 - _character.level) + target.before;
                }
                table2.push(target);
            }
            var roundupAve = Math.ceil(last.ave * (10 ^ 2)) / (10 ^ 2);
            var roundupPrm = Math.ceil(_status.before.parameter);
            var tweet = _character.name + "(星" + _character.rank+ "/" + _character.job + "/LV" + _character.level + "/" + _character.type + ")の";
            tweet += "戦闘力は" + roundupPrm + "。ステータスの平均増加は" + roundupAve + "です。"; 
            tweet += " http://cha2maru.github.io/pok/ #ファンキル #pokstatus"; 
            console.log(_character);
            console.log(_status);
            console.log(table1);
            console.log(table2);

            return {
                table1: table1,
                table2: table2,
                tweet: tweet
            };
        },
        input_status: function() {
            console.log("input_status");
            var status = {
                before: {
                    hp: this.before.hp,
                    str: this.before.str,
                    mag: this.before.mag,
                    def: this.before.def,
                    mnd: this.before.mnd,
                    spd: this.before.spd,
                    dex: this.before.dex,
                    lck: this.before.lck
                },
                after: {
                    hp: this.after.hp,
                    str: this.after.str,
                    mag: this.after.mag,
                    def: this.after.def,
                    mnd: this.after.mnd,
                    spd: this.after.spd,
                    dex: this.after.dex,
                    lck: this.after.lck
                }
            };

            return status;
        },
        input_character: function() {
            console.log("input_character");
            var _character = {
                rank: this.$get("inputRank"),
                name: this.$get("inputName"),
                type: this.$get("inputType"),
                level: this.$get("inputLevel"),
                job: this.$get("inputJob"),
                init: {},
                max: {},
                equip: {
                    hit: 0,
                    dmg: 0,
                    mdmg: 0,
                    def: 0,
                    mdef: 0
                }
            };

            if (this.entry[_character.rank][_character.name]
                [_character.job].status[_character.type]) {

                var init = this.entry[_character.rank][_character.name]
                    [_character.job].status[this.initType];
                var max = this.entry[_character.rank][_character.name]
                    [_character.job].status[_character.type];

                for (var i = 0; i < this.statusList.length; i++) {
                    console.log("statusListLoop:" + this.statusList[i].label + "/" + init[this.statusList[i].label]);
                    _character.init[this.statusList[i].suffix] = init[this.statusList[i].label];
                    console.log(_character.init[this.statusList[i].suffix]);
                }
                for (var i = 0; i < this.statusList.length; i++) {
                    _character.max[this.statusList[i].suffix] = max[this.statusList[i].label];
                }
            }
            _character.equip.hit = max["命中"] - max["技"] * 1.5 - max["運"] * 0.5;
            _character.equip.dmg = max["物攻"] - max["力"];
            _character.equip.mdmg = max["魔攻"] - max["魔"];
            _character.equip.def = max["防御"] - max["守"];
            _character.equip.mdef = max["魔防"] - max["精"];


            return _character;
        }
    },
    watch: {
        names: function(newval) {
            if (!this.names[0]) return;
            var target = this.$get("names")[0].value;
            this.$set("inputName", target);
            console.log("name" + target);
        },
        jobs: function(newval) {
            if (!this.jobs[0]) return;
            var target = this.$get("jobs")[0].value;
            this.$set("inputJob", target);
            console.log("job" + target);
        },
        input_character: function(newval, oldval) {
            console.log("character:old/new");
            console.log(oldval);
            console.log(newval);
            if (!oldval || (newval.rank + newval.name + newval.job) !== (oldval.rank + oldval.name + oldval.job)) {
                if (newval.init && newval.max) {
                    this.setInputStatus({
                        before: newval.max,
                        after: newval.init
                    });
                }
            }
            else {

            }
        },
        statusTable: function(newval, oldval) {
            console.log("statusTable:old/new");
            console.log(oldval);
            console.log(newval);
        },
    },
    data: {
        initType: '初期値',
        characterTypes: ['王姫型', '命姫型', '攻姫型', '魔姫型', '守姫型', '匠姫型'],
        before: {
            hp: 0,
            str: 0,
            mag: 0,
            def: 0,
            mnd: 0,
            spd: 0,
            dex: 0,
            lck: 0
        },
        after: {
            hp: 0,
            str: 0,
            mag: 0,
            def: 0,
            mnd: 0,
            spd: 0,
            dex: 0,
            lck: 0
        },
        maxLevel: {
            5: 80,
            4: 70,
            3: 60,
            2: 50,
            1: 40
        },
        statusTableIdx1: [{
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
        statusTableIdx2: [{
            suffix: "attack",
            label: "物攻"
        }, {
            suffix: "deffence",
            label: "防御"
        }, {
            suffix: "magic",
            label: "魔攻"
        }, {
            suffix: "mind",
            label: "魔防"
        }, {
            suffix: "hit",
            label: "命中"
        }, {
            suffix: "critical",
            label: "必殺"
        }, {
            suffix: "dudge",
            label: "回避"
        }, {
            suffix: "parameter",
            label: "戦闘力"
        }],

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
        }, {
            suffix: "attack",
            label: "物攻"
        }, {
            suffix: "deffence",
            label: "防御"
        }, {
            suffix: "magic",
            label: "魔攻"
        }, {
            suffix: "mind",
            label: "魔防"
        }, {
            suffix: "hit",
            label: "命中"
        }, {
            suffix: "critical",
            label: "必殺"
        }, {
            suffix: "dudge",
            label: "回避"
        }, {
            suffix: "parameter",
            label: "戦闘力"
        }],
        maxPoint: 200
    }
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
