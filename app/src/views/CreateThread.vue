<template>
  <div>
    <div class="container">
      <h1>Create Thread</h1>
      <div class="row">
        <div class="col-sm-8">
          <div class="form-group">
            <label for="inputTitle">Title</label>
            <input
              type="text"
              class="form-control"
              id="inputTitle"
              @focus="focusAt='title'"
              v-model="title"
            >
          </div>
          <div class="form-group">
            <label for="inputContent">Describe your question</label>
            <vue-editor v-model="content" :editorToolbar="customToolbar" @focus="focusAt='body'"></vue-editor>
          </div>
          <div class="form-group">
            <label for="inputTags">Related Tags</label>

            <vue-tags-input
              id="inputTags"
              v-model="tag"
              :tags="tags"
              :autocomplete-items="filteredItems"
              :add-on-key="[32]"
              @tags-changed="newTags => tags = newTags"
              @focus="focusAt='footer'"
            />
          </div>
          <input
            class="btn btn-primary btn-block"
            type="button"
            :disabled="isDisabled"
            value="Make your question"
            @click="addThread"
          >
        </div>
        <div class="col-sm-4" v-if="focusAt!=''">
          <div class="card text-white bg-primary mb-3">
            <div class="card-header">
              <h4>{{cardHeader}}</h4>
            </div>
            <div class="card-body">
              <h5 class="card-title">{{cardTitle}}</h5>
              <p class="card-text">{{cardText}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <NavBar/>
    <Footer/>-->
  </div>
</template>

<script>
import { VueEditor, Quill } from "vue2-editor";
import VueTagsInput from "@johmun/vue-tags-input";
//Tentar utilizar o quill
export default {
  components: {
    VueEditor,
    VueTagsInput
  },
  data() {
    return {
      isDisabled: true,
      title: "",
      content: "",
      customToolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["image", "code-block"]
      ],
      cardHeader: "",
      cardTitle: "",
      cardText: "",
      focusAt: "",
      tag: "",
      tags: [],
      autocompleteItems: this.$store.state.tags
    };
  },
  updated() {
    if (this.focusAt === "title") {
      this.cardHeader = "This is the title";
      this.cardTitle = "This is the first thing other users will see";
      this.cardText = "So use expressions that express your doubts clearly";
    } else if (this.focusAt === "body") {
      this.cardHeader = "This is the body";
      this.cardTitle = "This is where you express all of your doubts";
      this.cardText =
        "You can insert Images and text, so try to give as much information about your doubt as you can, so everybody will help you better";
    } else if (this.focusAt === "footer") {
      this.cardHeader = "This is the Tags you relate your question with";
      this.cardTitle = "Tags will help people find your question";
      this.cardText =
        "So use only the right tags here, and try to use the tags that are already created";
    }
    if (
      this.title.length > 0 &&
      this.content.length > 0 &&
      this.tags.length > 0
    ) {
      this.isDisabled = false;
    }
  },
  methods: {
    getLastID() {
      let maior;
      if (this.autocompleteItems.length != 0) {
        this.autocompleteItems.sort(function(a, b) {
          if (a.id > b.id) return 1;
          if (a.id < b.id) return -1;
        });
        maior = this.autocompleteItems[this.autocompleteItems.length - 1].id;
        console.log(maior);
        return maior;
      } else {
        return 0;
      }
    },
    addThread() {
      console.log(this.autocompleteItems);
      console.log(this.tags);
      //SEE IF ONE OF THE TAGS DONT EXIST~
      for (let i = 0; i < this.tags.length; i++) {
        if (
          this.autocompleteItems.filter(tag => tag.text == this.tags[i].text)
            .length == 0
        ) {
          console.log("Esta Tag Não Existe: " + this.tags[i].text);
          this.autocompleteItems.push({
            id: this.getLastID() + 1,
            text: this.tags[i].text
          });
        }
      }
      this.$store.dispatch("update_tags", this.autocompleteItems);
      this.$store.dispatch("add_thread", {
        id: 0,
        userid: this.$store.getters.getloginID,
        question: this.content,
        title: this.title,
        tags: this.tags,
        idGroup: null,
        upvotes: 0,
        date: new Date().toISOString().split("T")[0],
        views: 0,
        course: "",
        closeDate: null
      });
      this.$router.push({
        name: "AboutMe",
        params: { userid: this.$store.getters.getloginID }
      });
    }
  },
  computed: {
    filteredItems() {
      return this.autocompleteItems.filter(i => {
        return i.text.toLowerCase().indexOf(this.tag.toLowerCase()) !== -1;
      });
    }
  }
};
</script>
<style>
.vue-tags-input {
  background: #324652;
}
.vue-tags-input .ti-new-tag-input {
  background: transparent;
  color: rgba(0, 0, 0, 0.7);
}
.vue-tags-input .ti-autocomplete {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #8b9396;
  border-top: none;
}
.vue-tags-input .ti-item.ti-selected-item {
  background: #ebde6e;
  color: #283944;
}
.vue-tags-input .ti-tag {
  position: relative;
  background: rgb(26, 104, 248);
  color: #ffffff;
}
</style>
