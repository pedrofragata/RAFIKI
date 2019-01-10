import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

let $ = require("../node_modules/jquery/dist/jquery.js");


class User {
  constructor(id, nome, pass, mail, exp, desc, foto, follow, skill) { //fazer nos getter's a atribuição de badges, level e rank
    this.id = id; //Não vai ser preciso fazer o getId aqui, porque já é feito nos dois sitios onde os utilizadores são adicionados
    this.name = nome;
    this.password = pass;
    this.email = mail;
    this.exp = exp;
    this.level = this.getLevel();
    this.rank = this.getRank();
    this.badges = []
    this.desc = desc;
    this.foto = foto;
    this.follow = follow;
    this.skill = skill; //Isto devia ser um array, um gadjo pode ter váriass skills
  }

  getLevel() {
    return Math.floor(this.exp / 100) + 1;
  }

  getRank() {
    //Vai ter que se fazer um switch para dar os nomes aos ranks
    let rank = Math.floor(this.level / 10);
    let trueRank = null;
    console.log(this.level)
    switch (rank) { //O calculo do rank deve estar mal....
      case 0: trueRank = "A começar";
        break;
      case 1: trueRank = "grande";
        break;
      case 2: trueRank = "muito grande";
        break;
    }
    console.log(trueRank)
    console.log(rank)
    return [rank, trueRank];
  }

  // get badges() {
  //   this.badges = this.getBadges()
  // }

  // set badges(value){
  //   this.badges = value;
  // }

  getBadges(badgesArr, threadsArr) {
    let badges = []
    this.badges = [];
    console.log(threadsArr)
    let tr = this.getThreads(this.userId, threadsArr); //Isto depois vai substituir a batota
    let batota = 20;
    for (let badge of badgesArr) {
      let gravar = false;

      console.log(badge);
      if (badge.goal <= this.exp && badge.category == "rank") {
        gravar = true;
      }

      if (badge.category == "help") {
        if (badge.goal <= batota) {
          gravar = true;
        }
      }

      if (gravar) {
        badges.push(badge.id)
      }
    }
    console.log(this.badges)
    console.log(this.exp)
    return badges;
  }

  getThreads(userId, threadsArr) {
    let threads = []
    for (let thread of threadsArr) {
      if (thread.userId == userId) threads.push(thread)
    }
    return threads;
  }

  d() {
    console.log(this)
  }
}

export default new Vuex.Store({
  state: {
    Userclass: User,
    autenticated: false,
    loginid: 0,
    preenchido: false,
    users: [],
    badges: [
      //helpful awards
      {
        id: 1,
        name: "Nice, you're helpful!",
        goal: 10,
        desc: "Give 10 answers",
        category: "help"
      },
      {
        id: 2,
        name: "Damn! You know alot!",
        goal: 20,
        desc: "Give 20 answers",
        category: "help"
      },
      {
        id: 3,
        name: "We don't deserve you!",
        goal: 30,
        desc: "Give 30 answers",
        category: "help"
      },
      {
        id: 4,
        name: "You're like a guru!",
        goal: 40,
        desc: "Give 40 answers",
        category: "help"
      },
      {
        id: 5,
        name: "Rafiki, is that you?",
        goal: 100,
        desc: "Give 50 answers",
        category: "help"
      },
      // RANK AWARDS
      {
        id: 6,
        name: "THE BEST 100",
        goal: 200,
        desc: "Reach TOP 100",
        category: "rank"
      },
      {
        id: 7,
        name: "Keep climbing!",
        goal: 300,
        desc: "Reach TOP 60",
        category: "rank"
      },
      {
        id: 8,
        name: "Leave them behind!",
        goal: 400,
        desc: "Reach TOP 50",
        category: "rank"
      },
      {
        id: 9,
        name: "You're a beast!",
        goal: 500,
        desc: "Reach TOP 5",
        category: "rank"
      },
      {
        id: 10,
        name: "Our Lord, our Rafiki",
        goal: 600,
        desc: "Reach 1st place",
        category: "rank"
      },
      {
        id: 11,
        name: "10 Clicks!!! És grande",
        goal: 10,
        desc: "10 clicks on Rafiki",
        category: "hardwork" //Pode mudar de nome, mas devia ser uma categoria diferente
      }
    ],

    groups: [
      {
        id: 0,
        name: "",
        users: [2, 3, 34, 33]
      }
    ],
    threads: [
      {
        // id: 0,
        // userId: 0,
        // question: "",
        //Title:"",
        // tags: [],
        // idGroup: "", //Caso este id seja diferente de null, seginifica que este thread pertence a um grupo, caso contrário é um thread geral
        // upvotes: 0,
        // date: "xx/xx/xx",
        // views: 0, // Contador que vai ser incrementado de cada vez que alguém aceda a um thread
        // course: "",
        // closeDate: "xx/xx/xx"
      }
    ],
    answers: [
      {
        id: 0,
        idThread: 0,
        answer: "",
        idUser: 0,
        upvotes: 0,
        date: "xx/xx/xx"
      }
    ],
    coments: {
      id: 0,
      idAnswer: 0,
      idUser: 0,
      text: "",
      upvotes: 0
    }
  },
  plugins: [createPersistedState()],
  mutations: {
    addUser(state, user) {
      user.id = state.users.length == 0 ? 1 : state.users[state.users.length - 1].id + 1
      let us = new User(user.id, user.name, user.password, user.email,
        user.exp, user.desc, user.foto, user.follow, user.skills)
      state.users.push(us);
    },
    AUTHENTICATION(state) {
      state.autenticated = !state.autenticated;
    },
    CHANGE_LOGINID(state, payload) {
      state.loginid = payload;
    },
    save(state) {
      state.preenchido = true;
    },
    save_users(state, arr) {
      let aux = [];
      for (let user of arr) {
        let us = new User(user.id, user.name, user.password, user.email,
          user.exp, user.desc, user.foto, user.follow, user.skills);
        aux.push(us);
      }
      state.users = aux;
      console.log(state.users);
    }
  },
  actions: {
    addUserAct(context, user) {
      context.commit("addUser", user);
    },
    authentication(context) {
      context.commit("AUTHENTICATION");
    },
    change_loginid(context, payload) {
      context.commit("CHANGE_LOGINID", payload);
    },
    save(context) {
      context.commit("save");
    },
    save_users(context) {
      if (!localStorage.getItem("vuex") == true || JSON.parse(localStorage["vuex"]).users.length == 0) {
        console.log("ainda não está no localstorage");
        let payload = {
          // PKx5elCuP-52eqXNW9oWPQ, meu token
          // I6EFQFoKLa1FFP453_jzQg , token pedro
          // k_x0qyzrU3rzj9Y2qfzQSA, mais um meu
          // 8NqHTT2oovurU8SOUFhuSg, jonas
          token: "I6EFQFoKLa1FFP453_jzQg",
          data: {
            id: 1,
            name: "personNickname",
            password: "personPassword",
            email: "internetEmail",
            exp: "numberInt",
            level: 0,
            badges: [], //Já não é preciso pedir badges para os utilizadores
            rank: "numberInt",
            desc: "stringLong",
            foto: "personAvatar",
            follow: "functionArray|3|numberInt",
            skills: "personSkill",
            _repeat: 1
          }
        };

        $.ajax({
          type: "POST",
          url: "https:app.fakejson.com/q",
          data: payload,
          success: (resp => {
            // console.log(resp);
            return resp;
          })(ans => {
            for (let i = 0; i < ans.length; i++) {
              ans[i].id = i + 1;
            }
            console.log(ans);
            context.commit("save_users", ans);
          })
        })
      } else {
        // console.log(JSON.parse(localStorage["vuex"]).users);
        context.commit("save_users", JSON.parse(localStorage["vuex"]).users);
      }
    },
  },
  getters: {
    numberOfUsers: state => {
      return state.users.length;
    },
    getUsers: state => {
      return state.users;
    },
    getAuth: state => {
      return state.autenticated;
    },
    getloginID: state => {
      return state.loginid;
    },
    getBadges: state => {
      return state.badges;
    },
    getThreads: state => {
      return state.threads;
    }
  }
  //...mapGetters({

  // })
});
