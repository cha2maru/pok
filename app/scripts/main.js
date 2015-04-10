(function() {
    "use strict";
    var charaSelect;

    charaSelect = new Vue({
        el: "body",
        created: function() {
            // this.$watch("ranks",function(){
            //     this.$set("inputRank",this.ranks[0]);
            // });
            this.$set("entry", this.getEntry(data));
            this.$set("levels", this.getLevels());
            this.$set("ranks", this.getRanks());
            this.$set("types", this.getTypes());
            this.$set("pointsR", this.getPointsR());
            this.$set("points", this.getPoints());
        },
        ready: function() {
            this.$set("inputRank", this.ranks[0].value);
            this.$set("inputType", this.types[0].value);
            this.$set("inputLevel", this.levels[0].value);
            this.$set("inputLevel", this.levels[0].value);
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
                    var rank = json[id].summary.rank;
                    var name = json[id].summary.name;
                    var job = json[id].summary.job1;
                    var obj = {
                        summary: json[id].summary,
                        status: json[id].status
                    };
                    if (!entry[rank][name]) {
                        entry[rank][name] = {};
                    }
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
                var rank = this.inputRank;
                if (!rank) {
                    rank = 5;
                }

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
                target.ave = (target.before - target.after) /
                    (level - 1);
                target.limit = (60 - level) *
                    target.ave + target.before;
                target.limitbreak = (80 - level) *
                    target.ave + target.before;
                return target;
            },
            setInputStatus: function(target) {
                // console.log("setInputStatus");
                // console.log(target);
                for (var bkey in target.before) {
                    if (target.before[bkey] < 0) {
                        target.before[bkey] = 0;
                    }
                }
                for (var akey in target.after) {
                    if (target.after[akey] < 0) {
                        target.after[akey] = 0;
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
            setDefault: function() {
                if (!this.inputLevel && this.levels) {
                    this.$set("inputLevel", this.levels[0].value);
                }
                if (!this.inputType && this.types) {
                    this.$set("inputType", this.types[0].value);
                }
            }
        },
        filters: {
            roundup: function(value, num) {
                if (isNaN(value)) {
                    return value;
                }
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
                if (!rank) {
                    return list;
                }

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
                if (!rank || !name) {
                    return list;
                }

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

                var _chr = this.$get("inputChar");
                var _st = this.$get("input_status");


                _st.before.attack = _st.before.str + _chr.equip.dmg;
                _st.before.deffence = _st.before.def + _chr.equip.def;
                _st.before.mind = _st.before.mnd + _chr.equip.mdef;
                _st.before.magic = _st.before.mag + _chr.equip.mdmg;
                _st.before.hit = _st.before.dex * 1.5 +
                    _st.before.lck / 2 + _chr.equip.hit;
                _st.before.dudge = _st.before.spd *
                    1.5 + _st.before.lck / 2;
                _st.before.critical = _st.before.dex * 0.5;


                _st.before.parameter = _st.before.hp + _st.before.deffence +
                    _st.before.mind + _st.before.magic + _st.before.hit /
                    2 + _st.before.critical / 2 + _st.before.dudge / 2;
                _st.after.attack = _st.after.str + _chr.equip.dmg;
                _st.after.deffence = _st.after.def + _chr.equip.def;
                _st.after.mind = _st.after.mnd + _chr.equip.mdef;
                _st.after.magic = _st.after.mag + _chr.equip.mdmg;
                _st.after.hit = _st.after.dex * 1.5 + _st.after.lck /
                    2 + _chr.equip.hit;
                _st.after.dudge = _st.after.spd * 1.5 +
                    _st.after.lck / 2;
                _st.after.critical = _st.after.dex * 0.5;
                _st.after.parameter = _st.after.hp + _st.after.deffence +
                    _st.after.mind + _st.after.magic + _st.after.hit / 2 +
                    _st.after.critical / 2 + _st.after.dudge / 2;

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

                for (var i = 0; i < this.stIdx1.length; i++) {
                    var target1 = {};
                    target1.label = this.stIdx1[i].label;
                    target1.before = _st.before[this.stIdx1[i].suffix];
                    target1.after = _st.after[this.stIdx1[i].suffix];
                    target1.max = _chr.max[this.stIdx1[i].suffix];
                    last.before += target1.before;
                    last.after += target1.after;
                    last.max += target1.max;
                    if (_chr.level) {
                        target1.ave = (target1.before - target1.after) /
                            (_chr.level - 1);
                        target1.limit = target1.ave * (60 - _chr.level) +
                            target1.before;
                        target1.limitbreak = target1.ave * (80 - _chr.level) +
                            target1.before;
                        last.ave += target1.ave;
                        last.limit += target1.limit;
                        last.limitbreak += target1.limitbreak;
                    }
                    table1.push(target1);
                }
                table1.push(last);

                for (var i2 = 0; i2 < this.stIdx2.length; i2++) {
                    var target2 = {};
                    target2.label = this.stIdx2[i2].label;
                    target2.before = _st.before[this.stIdx2[i2].suffix];
                    target2.after = _st.after[this.stIdx2[i2].suffix];
                    target2.max = _chr.max[this.stIdx2[i2].suffix];
                    if (_chr.level) {
                        target2.ave = (target2.before - target2.after) /
                            (_chr.level - 1);
                        target2.limit = target2.ave * (60 - _chr.level) +
                            target2.before;
                        target2.limitbreak = target2.ave *
                            (80 - _chr.level) + target2.before;
                    }
                    table2.push(target2);
                }
                var roundupAve = Math.ceil(last.ave * (10 ^ 2)) / (10 ^ 2);
                var roundupPrm = Math.ceil(_st.before.parameter, 2);
                var tweet = _chr.name + "(星" +
                    _chr.rank + "/" + _chr.job +
                    "/LV" + _chr.level +
                    "/" + _chr.type + ")の";
                tweet += "戦闘力は" + roundupPrm +
                    "。ステータスの1LVでの平均増加は" +
                    roundupAve + "。";
                tweet += "ステータスは上から";
                for (var i2 = 0; i2 < this.stIdx1.length; i2++) {
                    tweet += _st.before[this.stIdx1[i2].suffix];
                    if (i2 < this.stIdx1.length - 1) {
                        tweet += "/";
                    }
                }

                tweet += "です。#pokstatus  #ファンキル";
                // console.log(_chr);
                // console.log(_st);
                // console.log(table1);
                // console.log(table2);

                return {
                    table1: table1,
                    table2: table2,
                    tweet: tweet
                };
            },
            input_status: function() {
                // console.log("input_status");
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
            tweet: function() {
                var _table = this.statusTable;
                var hashtag = "pokstatus";
                var url = "http://cha2maru.github.io/pok/";
                console.log(_table.tweet);

                return {
                    text: _table.tweet,
                    hashtag: "pokstatus",
                    url: "http://cha2maru.github.io/pok/",
                    a: '<a href="https://twitter.com/share" class="twitter-share-button" data-lang="ja" data-text="' +
                        _table.tweet + '" data-url="' + url + '" data-hashtag="' + hashtag + '">Tweet</a>'
                };
            },
            inputChar: function() {
                // console.log("inputChar");
                var _chr = {
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

                if (this.entry[_chr.rank][_chr.name]
                    [_chr.job].status[_chr.type]) {

                    var init = this.entry[_chr.rank][_chr.name]
                        [_chr.job].status[this.initType];
                    var max = this.entry[_chr.rank][_chr.name]
                        [_chr.job].status[_chr.type];

                    for (var iC = 0; iC < this.statusList.length; iC++) {
                        _chr.init[this.statusList[iC].suffix] =
                            init[this.statusList[iC].label];
                    }
                    for (var mC = 0; mC < this.statusList.length; mC++) {
                        _chr.max[this.statusList[mC].suffix] =
                            max[this.statusList[mC].label];
                    }

                    _chr.equip.hit = max["命中"] - max["技"] *
                        1.5 - max["運"] * 0.5;
                    _chr.equip.dmg = max["物攻"] - max["力"];
                    _chr.equip.mdmg = max["魔攻"] - max["魔"];
                    _chr.equip.def = max["防御"] - max["守"];
                    _chr.equip.mdef = max["魔防"] - max["精"];
                }

                return _chr;
            }
        },
        watch: {
            inputRank: function() {},
            names: function() {
                if (!this.names[0]) {
                    return;
                }
                else {
                    if (!this.inputName || this.names.indexOf(this.getOptionObject(this.inputName)) < 0) {
                        this.$set("inputName", this.names[0].value);
                    }
                }
            },
            jobs: function() {
                if (!this.jobs[0]) {
                    return;
                }
                else {
                    if (!this.inputJob || this.jobs.indexOf(this.getOptionObject(this.inputJob)) < 0) {
                        this.$set("inputJob", this.jobs[0].value);
                    }
                }
            },
            inputChar: function(newval, oldval) {
                // console.log("character:old/new");
                // console.log(oldval);
                // console.log(newval);

                if (newval.max.hp > 0) {
                    if (oldval) {
                        if (('' + oldval.rank + oldval.name + oldval.job) != ('' + newval.rank + newval.name + newval.job)) {
                            this.setInputStatus({
                                before: newval.max,
                                after: newval.init
                            });
                        }
                    }
                    else {
                        this.setInputStatus({
                            before: newval.max,
                            after: newval.init
                        });
                    }
                }
            },
            // statusTable: function(newval, oldval) {
            //     console.log("statusTable:old/new");
            //     console.log(oldval);
            //     console.log(newval);
            // },
            tweet: function() {
                // if (twttr) {
                    twttr.widgets.load();
                // }
            },
        },
        data: {
            initType: '初期値',
            characterTypes: ['王姫型', '命姫型', '攻姫型',
                '魔姫型', '守姫型', '匠姫型'
            ],
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
            stIdx1: [{
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
            stIdx2: [{
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
    Vue.nextTick(function() {
        var _iChar = charaSelect.inputChar;
        charaSelect.setInputStatus({
            before: _iChar.max,
            after: _iChar.init
        })
    });
})();
