<template>
  <div class="shipdata">
    <div class="gotoshiplist">
      <router-link :to="`/ship-list`" tag = 'button'>
        <v-btn color="primary" text>
          <v-icon>mdi-arrow-left-bold</v-icon>
          SHIP LIST
        </v-btn>
      </router-link>
    </div>
    <v-card
    :loading="loading"
    class="mx-auto my-card"
    >
      <template slot="progress">
        <v-progress-linear
          color="primary"
          height="10"
          indeterminate
        ></v-progress-linear>
      </template>

      <v-img
        max-height="800"
        contain
        :src=image
      ></v-img>
      <div v-if="isalert">
        <v-progress-linear
          indeterminate
          color="primary"
        ></v-progress-linear>
        <v-alert 
          border="bottom"
          colored-border
          type="warning"
          elevation="2"
        >
        [Warning] If the average value contains elements that cannot be calculated, remove them and request the server.
        </v-alert>
      </div>
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title class="text-h5 text-left">
            {{shipName}}
          </v-list-item-title>
          
          <v-list-item-subtitle class="text-left" >
            IMO: {{shipid}} 
            <a :href="`https://www.marinetraffic.com/en/ais/details/ships/imo:${shipid}`"
              target='_blank'
              style="text-decoration:none; color:white;"
            >
              <v-icon size="20px">
                {{ 'mdi-map-search-outline' }}
              </v-icon>
            </a>
          </v-list-item-subtitle>
          
        </v-list-item-content>
      </v-list-item>

      <v-card-text>
        <v-list class="transparent">
        <v-list-item
          class="my-list-item"
          v-for="param in params"
          :key="param.name"
        >
          <v-list-item-subtitle class="text-left">{{param.name}}</v-list-item-subtitle>
          <v-list-item-subtitle class="text-left" style="color:royalblue">{{param.value}}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      </v-card-text>

      <v-divider class="mx-4"></v-divider>

      <v-card-title>Operation data</v-card-title>

      <v-card-text class="text-left">
          <v-list-item class="my-list-item2">
            <v-list-item-subtitle class="text-left">[Accumulated operating hours]</v-list-item-subtitle>
          </v-list-item>
          <v-list-item
            class="my-list-item"
            v-for="operation in operations"
            :key="operation.name"
          >
            <v-list-item-subtitle class="text-left" style="text-transform:uppercase">{{operation.name}}-MODE</v-list-item-subtitle>
            <v-list-item-subtitle class="text-left" style="color:royalblue; white-space: pre;">{{operation.value}}</v-list-item-subtitle>
          </v-list-item>
      </v-card-text>

      <v-divider class="mx-4"></v-divider>
      
      <v-card-title>Detail figures</v-card-title>

      <v-card-text class="text-left">
        <v-list-item>
          <v-chip-group
              v-model="selection"
              active-class="primary accent-4 white--text"
              column
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon 
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-ship-wheel
                </v-icon>
              </template>
              <span>
                <div class="hint">Select the operation type</div> 
              </span>
            </v-tooltip>
            <div 
              v-for="opmode in opmodes"
              :key="opmode.name"
            >
              <v-chip style="text-transform:capitalize" label>{{opmode.name}}</v-chip>
            </div>
            <v-chip @click="InitViewType" style="text-transform:capitalize" label >Alarm</v-chip>
          </v-chip-group>
          <v-spacer></v-spacer>
          <v-chip-group
              v-model="viewtype"
              active-class="primary accent-4 white--text"
              column
          >
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon 
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-database-eye-outline
                </v-icon>
              </template>
              <span>
                <div class="hint">Select the visualization type</div> 
              </span>
            </v-tooltip>
            <v-chip style="text-transform:capitalize" label>Sheet</v-chip>
            <v-chip style="text-transform:capitalize" label>Trend line</v-chip>            
            <v-chip style="text-transform:capitalize" label>Average</v-chip>
          </v-chip-group>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon 
                v-bind="attrs"
                v-on="on"
              >
              mdi-filter-settings-outline
              </v-icon>
            </template>
            <span>
              <div class="hint">Select tags to activate</div> 
            </span>
          </v-tooltip>
          <v-chip style="text-transform:capitalize" label @click="ClickFilterSet">...</v-chip>
        </v-list-item>

        <v-list-item class="my-list-item2">
          <!-- 날짜 -->
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            :return-value.sync="dates"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-combobox
                id="datepicker"
                v-model="dates"
                multiple
                chips
                small-chips
                label="Multiple dates picker in menu"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
                @click="MoveScroll(false)"
              ></v-combobox>
            </template>

            <v-date-picker
              v-model="dates"
              range
              scrollable
            >
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="menu = false"
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.menu.save(dates)"
              >
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
          <v-spacer></v-spacer>
          <!-- 시작시간 -->
          <v-menu
            ref="startpick"
            v-model="startpick"
            :close-on-content-click="false"
            :return-value.sync="startTime"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="startTime"
                label="Start time"
                prepend-icon="mdi-clock-start"
                v-bind="attrs"
                v-on="on"
                @click="MoveScroll(false)"
              ></v-text-field>
            </template>
            <v-time-picker
              v-model="startTime"
              format="24hr"
              scrollable
            >
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="startpick = false"
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.startpick.save(startTime)"
              >
                OK
              </v-btn>
            </v-time-picker>
          </v-menu>
          <v-spacer></v-spacer>
          <!-- 종료시간 -->
          <v-menu
            ref="endpick"
            v-model="endpick"
            :close-on-content-click="false"
            :return-value.sync="endTime"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="endTime"
                label="End time"
                prepend-icon="mdi-clock-end"
                v-bind="attrs"
                v-on="on"
                @click="MoveScroll(false)"
              ></v-text-field>
            </template>
            <v-time-picker
              v-model="endTime"
              format="24hr"
              scrollable
            >
              <v-spacer></v-spacer>
              <v-btn
                text
                color="primary"
                @click="endpick = false"
              >
                Cancel
              </v-btn>
              <v-btn
                text
                color="primary"
                @click="$refs.endpick.save(endTime)"
              >
                OK
              </v-btn>
            </v-time-picker>
          </v-menu>
        </v-list-item>
      </v-card-text>

      <v-card-actions id="footerbutton">
        <v-spacer></v-spacer>

        <router-link :to="`/ship-data/${shipid}/data-view/${viewid}${selectedColString}`" tag = 'button'>
          <v-btn
            small
            color="primary"
            @click="[ShowData(true),isscrollup=true]"
            style="margin-right:10px"
          >
            View Detail
          </v-btn>
        </router-link>
      </v-card-actions>

      <DataView :columns="selectedColumns" :shipid="shipid" @openDetailTrend="OpenDetailTrend"></DataView>
      <v-btn
        color="primary lighten-2"
        text
        v-if="isscrollup"
        @click="ShowData(false)"
        width="max"
      > 
        <v-icon dark>
          mdi-stairs-up
        </v-icon>
        Scroll-up
      </v-btn>

    </v-card>
    <DetailTrend v-if="istrendshow" @close="istrendshow=false"></DetailTrend>
    <ColumnPicker :columns="columns" :pageid="pageid"
    v-if ="iscolpick" @close="iscolpick=false" @aplly="FetchColumnList"  ></ColumnPicker>
    
  </div>
</template>

<script>
import {list,data} from '../api'
import ColumnPicker from '../components/ColumnPicker'
import DataView from '../components/DataView'
import DetailTrend from '../components/DetailTrend'

export default {
  name: 'ShipData',
  components: {
    //ES6 부터 key, value의 변수명이 같을때 생략이 가능하다
    // ColumnPicker : ColumnPicker
    ColumnPicker,
    DataView,
    DetailTrend,
  },
  data () {
    return{
      dates: [
        (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
      ],
      scrollY: 0,
      istrendshow:false,
      isalert:false,
      isscrollup:false,
      error:'',
      startTime: '00:00',
      endTime: '23:59',
      menu: false,
      iscolpick: false,
      startpick: false,
      endpick: false,
      loading: false,
      shipid: '',
      selection: 0,
      viewtype:0,
      selectedUrl:'',
      columns:[],
      selectedColumns:[],
      selectedColString:'',
      pageid:'',
      viewid:'default',
      image:'https://photos.marinetraffic.com/ais/showphoto.aspx?photoid=2597671',
      shipName: '',
      params: [
        {
          name:"",
          value:"",
        },
      ],
      opmodes:[
        {
          name:"ballast",
        },
        {
          name:"deballast",
        },
        {
          name:"bypass",
        },
      ],
      operations: [
        {
          name:"ballast",
          value:"00:05:34",
        },
        {
          name:"deballast",
          value:"00:07:17",
        },
        {
          name:"bypass",
          value:"17:23:34",
        },
      ]
    }
  },
  watch:{
    selection(){
      this.SetViewId()
      this.FetchColumnList()
    },
    viewtype(){
      this.SetValidAvgCol()
      this.SetViewId()
    },
    dates(){
      this.SetViewId()
    },
    startTime(){
      this.SetViewId()
    },
    endTime(){
      this.SetViewId()
    },
  },
  created() {
    //ref route/index.js
    this.shipid = this.$route.params.shipid
    this.FetchData()
    this.SetViewId()
    scrollTo(0,0)

    window.addEventListener("scroll",this.handleScroll)
  },
  methods:{
    handleScroll() {
      this.scrollY = window.scrollY
    },
    OpenDetailTrend(){
      this.istrendshow = true
    },
    MoveScroll(v){
      document.getElementById("footerbutton").scrollIntoView(v)
    },
    ShowData(v){
      document.getElementById("footerbutton").scrollIntoView(v)
    },
    ClickFilterSet(){
      this.iscolpick = true
    },
    InitViewType(){
      this.viewtype = ''
    },
    SetValidAvgCol(){
      
      if (this.viewtype != 0){
        this.isalert = true;
        setTimeout(() => {
          this.isalert = false;
        }, 5000);

        this.selectedColumns = this.selectedColumns.filter((element)=>element.data_type !== 'text')
        this.selectedColumns = this.selectedColumns.filter((element)=>element.data_type !== 'boolean')
      }
      else{
        this.FetchColumnList()
      }
    },
    SetViewId(){
      if (this.dates[0]>this.dates[1] && this.dates[1] != null){
      //구조분해 할당 문법 = 멀티 SWAP 기능
        [this.dates[0],this.dates[1]] = [this.dates[1],this.dates[0]]
      }

      this.viewid = this.opmodes[this.selection].name + ';' + 
                    this.viewtype + ';' + 
                    this.dates[0] + ';' +
                    (this.dates[1]?this.dates[1]:this.dates[0]) + ';' +
                    this.startTime + ';' +
                    this.endTime + ';'
    },
    FetchData(){
      this.loading = true
      this.pageid = this.shipid + this.opmodes[this.selection].name
      //setTimeout(() => (this.loading = false), 2000)
      list.fetch(localStorage.getItem('account'),this.shipid)
        .then(data => {
          this.params.splice(0,this.params.length)
          this.shipName = data.data.hull_name
          this.params.push({
              name: "Ship Owner",
              value: data.data.owner_name
          })
          this.params.push({
              name: "Flag",
              value: data.data.hull_flag
          })
          this.params.push({
              name: "Install Date",
              value: new Date(data.data.hull_product_installed_date).toLocaleDateString()
          })
          this.params.push({
              name: "Model",
              value: `${data.data.hull_product}(${data.data.hull_product_ver})`
          })
        })
        .catch(res=>{
          this.error = res.response.data
          console.log(this.error)
        })
        .finally(()=>{
          this.loading = false
        })
      data.fetch(this.shipid)
      .then(datas => {
        this.operations.splice(0,this.operations.length)
        datas.list.forEach((data) => {
          this.operations.push({
            name: data.operation_name,
            value: `${(data.total_operation_duration ? (data.total_operation_duration.days? data.total_operation_duration.days:0) : 0).toString()} day ${(data.total_operation_duration ? (data.total_operation_duration.hours? data.total_operation_duration.hours:0) : 0).toString().padStart(2,'0')} :${(data.total_operation_duration ? (data.total_operation_duration.minutes? data.total_operation_duration.minutes:0) : 0).toString().padStart(2,'0')} :${(data.total_operation_duration ? (data.total_operation_duration.seconds? data.total_operation_duration.seconds:0) : 0).toString().padStart(2,'0')}  ${data.min == null? '':`(${new Date(data.min).toLocaleDateString()}~${new Date(data.max).toLocaleDateString()})`}`
          })
        })
        
      })
      .catch(res=>{
          this.error = res.response.data
          console.log(this.error)
      })
      
      data.fetchColumn(this.shipid,this.opmodes[this.selection].name)
      .then(datas => {
        this.columns = datas.list
        this.selectedColumns = localStorage.getItem(this.pageid)? JSON.parse(localStorage.getItem(this.pageid)):this.columns

        this.selectedColString = ''         
        const notfoundindexs = []
        this.selectedColumns.forEach((element,i)=>{
          const columnItem = this.columns.find(v=>v.column_name === element.column_name)
          if (columnItem != null)
          {
            this.selectedColString+=`,${element.column_name}`
          }
          else
            notfoundindexs.push(i)
        })
        notfoundindexs.forEach(i=>{
          this.selectedColumns.splice(i,1)
        })
      })
      .catch(res=>{
          this.error = res.response.data
          console.log(this.error)
      })
    },
    FetchColumnList(){
      this.loading = true
      this.pageid = this.shipid + this.opmodes[this.selection].name
 
      data.fetchColumn(this.shipid,this.opmodes[this.selection].name)
      .then(datas => {
        this.columns = datas.list
        this.selectedColumns = localStorage.getItem(this.pageid)? JSON.parse(localStorage.getItem(this.pageid)):this.columns
        
        this.selectedColString = ''         
        this.selectedColumns.forEach((element)=>{
          this.selectedColString+=`,${element.column_name}`
        })
      })
      .catch(res=>{
          this.error = res.response.data
          console.log(this.error)
      })
    },
  },
}
</script>

<style scoped>

  .shipdata{
    background-color: #EDF2FA;
    min-height: calc(100vh - 64px);
    padding: 40px;
  }
  .my-card{
    max-width: 60vw;
  }
  .my-text-field{
    max-width: 200px;
    max-height: 50px;
  }
  .my-list-item{
    margin-top:-25px;
    margin-bottom:-25px;
  }
  .my-list-item2{
    margin-top:-10px;
    margin-bottom:-10px;
  }
  .gotoshiplist{
    position:fixed;
    z-index:999;
    width:15vw;
    top:50vh;
    height:100vh;
  }

</style>