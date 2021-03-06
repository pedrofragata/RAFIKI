import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import axios from "axios";

Vue.use(Vuex);

let $ = require("../node_modules/jquery/dist/jquery.js");

class User {
  constructor(
    id,
    nome,
    pass,
    mail,
    exp,
    desc,
    foto,
    follow,
    year,
    course,
    upvotes,
    notifications
  ) {
    //fazer nos getter's a atribuição de badges, level e rank
    this.id = id; //Não vai ser preciso fazer o getId aqui, porque já é feito nos dois sitios onde os utilizadores são adicionados
    this.name = nome;
    this.password = pass;
    this.email = mail;
    this.experience = exp;
    this.level = this.getLevel();
    this.rank = this.getRank();
    this.badges = [];
    this.description = desc;
    this.picture = foto;
    this.follow = follow;
    // this.skill = skill; //Isto devia ser um array, um gadjo pode ter váriass skills
    this.year = year;
    this.course = course;
    this.upvotes = upvotes;
    this.notifications = notifications;
  }

  getLevel() {
    return Math.floor(this.experience / 100) + 1;
  }

  getRank() {
    //Vai ter que se fazer um switch para dar os nomes aos ranks
    let rank = Math.floor(this.level / 10);
    let trueRank = null;
    // console.log(this.level);
    switch (
      rank //O calculo do rank deve estar mal....
    ) {
      case 0:
        trueRank = "A começar";
        break;
      case 1:
        trueRank = "grande";
        break;
      case 2:
        trueRank = "muito grande";
        break;
    }

    // console.log(trueRank);
    // console.log(rank);
    return [rank, trueRank];
  }
  getBadges(badgesArr, threadsArr, commentsArr, answersArr) {
    let badges = [];
    this.badges = [];
    // console.log(threadsArr);
    let tr = this.getThreads(threadsArr, commentsArr, answersArr); //Isto depois vai substituir a batota
    console.log(tr);
    // let batota = 20;
    for (let badge of badgesArr) {
      let gravar = false;

      console.log(badge);
      if (badge.goal <= this.exp && badge.category == "rank") {
        gravar = true;
      }

      if (badge.category == "help") {
        if (badge.goal <= tr) {
          gravar = true;
        }
      }

      if (gravar) {
        badges.push(badge.id);
      }
    }
    console.log(this.badges);
    console.log(this.exp);
    return badges;
  }

  getThreads(threadsArr, commentsArr, answersArr) {
    /* Vai ter que returnar um numero */
    let total = 0;

    total += threadsArr.filter(th => th.userid == this.id).length;
    total += commentsArr.filter(cm => cm.idUser == this.id).length;
    total += answersArr.filter(ans => ans.idUser == this.id).length;
    return total;
  }

  d() {
    console.log(this);
  }

  tamanhoMaximo() {
    if (this.notifications.length == 6) this.notifications.shift();
  }
}

class Thread {
  constructor(
    id,
    userInfo,
    title,
    question,
    idGroup,
    course,
    upvotes,
    closedate,
    views
  ) {
    this.id = id;
    this.userInfo = userInfo;
    this.title = title;
    this.question = question;
    this.tags = [];
    this.idGroup = idGroup;
    this.upvotes = upvotes;
    this.date = new Date().toISOString().split("T")[0];
    this.course = course;
    this.closeDate = closedate;
    this.views = views;
  }
}
class Answer {
  constructor(id, idThread, ans, idUser, upvotes) {
    this.id = id;
    this.idThread = idThread;
    this.answer = ans;
    this.idUser = idUser;
    this.upvotes = upvotes;
    this.date = new Date().toISOString().split("T")[0];
  }
}

class Notification {
  constructor(id, idthread, idUserFirst, text) {
    this.id = id;
    this.idThread = idthread;
    this.idUserFirst = idUserFirst;
    this.text = text;

    this.data = new Date().toISOString().split("T")[0];
    this.visto = false;
  }
}
export default new Vuex.Store({
  state: {
    port: "127.0.0.1",
    doneUsers: false,
    Userclass: User, //Tem que sair
    ThreadClass: Thread, //Tem que sair
    autenticated: false,
    loginid: 0,
    preenchido: false,
    searchTag: "",
    users: [],
    badges: [],
    groups: [
      {
        id: 0,
        name: "",
        users: [2, 3, 34, 33]
      }
    ],
    threads: [
      // {
      //   id: 1,
      //   userid: 1,
      //   question:
      //     "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consecteturNeque porro quisquam est qui dolorem ipsum quia dolor sit amet, consecteturNeque porro quisquam est qui dolorem ipsum quia dolor sit amet, consecteturNeque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur",
      //   title: "Como crio um component em vue.js?",
      //   tags: [],
      //   // idGroup: "", //Caso este id seja diferente de null, seginifica que este thread pertence a um grupo, caso contrário é um thread geral
      //   upvotes: [],
      //   date: "xx/xx/xx",
      //   // views: 0, // Contador que vai ser incrementado de cada vez que alguém aceda a um thread
      //   course: "TSIW"
      //   // closeDate: "xx/xx/xx"
      // }
    ],
    tags: [
      {
        id: 1,
        text: "vue.js"
      },
      {
        id: 2,
        text: "javascript"
      }
    ],
    answers: [
      // {
      //   id: 0,
      //   idThread: 0,
      //   answer: "",
      //   idUser: 0,
      //   upvotes: 0,
      //   date: "xx/xx/xx"
      // }
    ],
    comments: [
      // {
      // id: 0,
      // idAnswer: 0,
      // idUser: 0,
      // text: "",
      // upvotes: 0
      // }
    ]
  },
  // plugins: [createPersistedState()],
  /**
   * Mutations
   */
  mutations: {
    addUser(state, user) {
      user.id =
        state.users.length == 0
          ? 1
          : state.users[state.users.length - 1].id + 1;
      let us = new User(
        user.id,
        user.name,
        user.password,
        user.email,
        user.experience,
        user.description,
        user.picture,
        user.follow,
        // user.skills,
        user.year,
        user.course,
        [],
        []
      );
      state.users.push(us);
    },
    UPDATE_TAGS(state, payload) {
      state.tags = payload;
    },
    AUTHENTICATION(state) {
      state.autenticated = !state.autenticated;
    },
    CHANGE_LOGINID(state, payload) {
      state.loginid = payload;
    },
    ADD_THREAD(state, payload) {
      let aux = state.threads;
      if (state.threads.length != 0) {
        state.threads.sort(function(a, b) {
          if (a.id > b.id) return 1;
          if (a.id < b.id) return -1;
        });
        payload.id = state.threads[state.threads.length - 1].id + 1;
        console.log(payload.id);
      } else {
        payload.id = 1;
      }

      aux.push(payload);
      console.log(aux);
      state.threads = aux;
      //Achoq que vai ser auqi que vai ser atualoizado a experiencia do user
    },
    save(state) {
      state.preenchido = true;
    },
    get_users(state, arr) {
      let aux = [];

      // console.log(arr);
      for (let user of arr) {
        let ups = user.upvotes == undefined ? [] : user.upvotes;
        let notis = user.notifications == undefined ? [] : user.notifications;
        let us = new User(
          user.id,
          user.name,
          user.password,
          user.email,
          user.experience,
          user.description,
          user.picture,
          user.follow,
          user.year,
          user.course,
          ups,
          notis
        );
        aux.push(us);
      }
      state.users = aux;
      state.doneUsers = true;
      console.log(state.users, "users na store depois do commit");
    },
    get_threads(state, arr) {
      // console.log(arr);
      let aux = [];
      for (let thread of arr) {
        let views = thread.views == undefined ? 0 : thread.views;
        let closedate =
          thread.closeDate == undefined || thread.closeDate == null
            ? null
            : thread.closeDate;
        // console.log(closedate)
        let th = new Thread(
          thread.id,
          thread.userInfo,
          thread.title,
          thread.question,
          0,
          null,
          thread.upvotes,
          closedate,
          views
        );
        // let views = thread.views == undefined ? 0 : thread.views;
        // let closedate =
        //   thread.closeDate == undefined || null ? null : thread.closeDate;
        // let th = new Thread(
        //   thread.id,
        //   thread.userid,
        //   thread.title,
        //   thread.question,
        //   0,
        //   null,
        //   thread.upvotes,
        //   closedate,
        //   views
        // );

        th.tags.push(
          {
            id: 1,
            text: "vue.js"
          },
          {
            id: 2,
            text: "javascript"
          }
        );

        aux.push(th);
      }
      state.threads = aux;
    },
    get_answers(state, arr) {
      let aux = [];
      for (let ans of arr) {
        let as = new Answer(
          ans.id,
          ans.idThread,
          ans.answer,
          ans.idUser,
          ans.upvotes
        );
        aux.push(as);
      }

      state.answers = aux;
    },
    add_answer(state, answer) {
      state.answers.push(answer);
      let index = state.users.findIndex(us => us.id == answer.idUser);
      state.users[index].exp += 20;
    },
    get_comment(state, arr) {
      state.comments = arr;
    },
    UPDATE_USER(state, newUser) {
      let index = state.users.findIndex(user => user.id == newUser.id);
      state.users[index].email = newUser.email;
      state.users[index].name = newUser.name;
      state.users[index].password = newUser.password;
      state.users[index].course = newUser.course;
      state.users[index].year = newUser.year;
      state.users[index].bio = newUser.bio;
      state.users[index].picture = newUser.picture;
    },
    SEARCH_TAG(state, tag) {
      state.searchTag = tag;
    },
    add_upvote_thread(state, id) {
      state.threads.filter(th => th.id == id)[0].upvotes++;
    },
    add_upvote_answer(state, id) {
      //É o id da answer
      state.answers.filter(ans => ans.id == id)[0].upvotes++;
    },
    add_upvote_comment(state, id) {
      state.comments.filter(com => com.id == id)[0].upvotes++;
    },
    add_upvote_user(state, up) {
      console.log("ata");
      let addExp = 10;

      let index = state.users.findIndex(us => us.id == up.userid);
      state.users[index].exp += addExp;
      console.log(state.users[index].exp);
      state.users[index].upvotes.push(up.up);
    },
    DELETE_USER(state, id) {
      let index = state.users.findIndex(user => user.id == id);
      state.users.splice(index, 1);
    },
    DELETE_BADGE(state, id) {
      let index = state.badges.findIndex(badge => badge.id == id);
      state.badges.splice(index, 1);
    },
    DELETE_THREAD(state, id) {
      let index = state.threads.findIndex(thread => thread.id == id);
      state.threads.splice(index, 1);
    },
    DELETE_TAG(state, id) {
      let index = state.tags.findIndex(tag => tag.id == id);
      state.tags.splice(index, 1);
    },

    ADD_BADGE(state, payload) {
      let aux = state.badges;
      aux.push(payload);
      console.log(aux);
      state.badges = aux;
    },
    add_comment(state, com) {
      state.comments.push(com);
      let index = state.users.findIndex(us => us.id == com.idUser);
      state.users[index].exp += 20;
    },
    add_user_follow(state, obj) {
      state.users[obj.index].follow.push(obj.threadid);
    },
    CLOSE_THREAD(state, id) {
      let index = state.threads.findIndex(thread => thread.id == id);
      console.log(index);
      state.threads[index].closeDate = new Date().toISOString().split("T")[0];
    },
    /* Notificações */
    add_notification(state, obj) {
      let index = state.users.findIndex(us => us.id == obj.idUser);
      state.users[index].notifications.push(obj.notification);
    },
    change_notification_status(state, obj) {
      // console.log(obj);
      state.users[obj.indexUser].notifications[obj.indexNoti].visto = true;
      if (state.users[obj.indexUser].notifications.length == 6)
        state.users[obj.indexUser].notifications.shift();
    },
    /* views */
    increment_views(state, idthread) {
      // console.log("MUTATION");
      let index = state.threads.findIndex(thr => thr.id == idthread);
      state.threads[index].views++;
    },
    add_tag(state, tag) {
      state.tags.push(tag);
    },
    get_badges(state, arr) {
      console.log(arr, "array badges mutation");
      state.badges = arr;
    }
  },
  /**
   * ACTIONS
   */
  actions: {
    /* tags */
    add_tag(context, tag) {
      context.commit("add_tag", tag);
    },
    /* views */
    increment_views(context, idthread) {
      // console.log("ACTION");
      context.commit("increment_views", idthread);
    },
    /* Notificações */
    change_notification_status(context, obj) {
      context.commit("change_notification_status", obj);
    },
    add_notification(context, obj) {
      console.log(obj);
      let newNotification = new Notification(
        obj.notification.id,
        obj.notification.idThread,
        obj.notification.idUserFirst,
        obj.notification.text
      );
      context.commit("add_notification", {
        idUser: obj.idUser,
        notification: newNotification
      });
    },
    // OFFICE
    close_thread(context, id) {
      context.commit("CLOSE_THREAD", id);
    },
    delete_user(context, id) {
      context.commit("DELETE_USER", id);
    },

    delete_badge(context, id) {
      context.commit("DELETE_BADGE", id);
    },

    delete_thread(context, id) {
      context.commit("DELETE_THREAD", id);
    },

    delete_tag(context, id) {
      context.commit("DELETE_TAG", id);
    },

    add_badge(context, payload) {
      context.commit("ADD_BADGE", payload);
    },
    add_answer(context, answer) {
      context.commit("add_answer", answer);
    },
    /* 3 actions e 3 mutations para (threads, answers, comments) */
    add_comment(context, comment) {
      context.commit("add_comment", comment);
    },
    add_upvote_thread(context, id) {
      context.commit("add_upvote_thread", id);
    },
    add_upvote_answer(context, id) {
      context.commit("add_upvote_answer", id);
    },
    add_upvote_comment(context, id) {
      context.commit("add_upvote_comment", id);
    },
    add_upvote_user(context, up) {
      context.commit("add_upvote_user", up);
      console.log("Isto é um upvote", up);
    },
    update_user(context, newUser) {
      context.commit("UPDATE_USER", newUser);
    },
    search_tag(context, tag) {
      context.commit("SEARCH_TAG", tag);
    },
    addUserAct(context, user) {
      context.commit("addUser", user);
      return true;
    },
    update_tags(context, payload) {
      context.commit("UPDATE_TAGS", payload);
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
    add_thread(context, payload) {
      context.commit("ADD_THREAD", payload);
    },
    get_users(context) {
      if (context.state.users.length == 0) {
        axios
          .get(`http://${context.state.port}:420/data-api/users`)
          // .then(resp => resp.json())
          .then(collection => {
            let sortedUsers = collection.data.sort((a, b) => a.id - b.id);
            // console.log(sortedUsers, 'users')
            context.commit("get_users", sortedUsers);
            return sortedUsers;
          })
          .catch(err => console.log(err, "Erro"));
      }
    },
    get_threads(context) {
      //Serve para ir buscar as threads
      axios
        .get(`http://${context.state.port}:420/data-api/threads`)
        .then(collection => {
          let sortedThreads = collection.data.sort((a, b) => a.id - b.id);
          console.log(sortedThreads, "threads");
          context.commit("get_threads", sortedThreads);
        })
        .catch(err => console.log(err, "Erro nos Threads"));
    },
    get_answers(context) {
      //seRVE PARA ir buscar as answers
    },
    get_comment(context) {
      //Ir buscar todos os comentários
    },
    get_badges(context) {
      axios
        .get(`http://${context.state.port}:420/data-api/badges`)
        .then(collection => {
          let sortedBadges = collection.data.sort((a, b) => a.id - b.id);
          console.log(sortedBadges, "badges");
          context.commit("get_badges", sortedBadges);
        })
        .catch(err => console.log(err, "erro nos badges"));
    },
    add_user_follow(context, obj) {
      let index = this.getters.getUsers.findIndex(us => us.id == obj.userid);
      context.commit("add_user_follow", {
        index: index,
        threadid: obj.threadid
      });
    }
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
    },
    getAnswers: state => state.answers,
    getComments: state => state.comments,
    getTags: state => state.tags
  }
});
