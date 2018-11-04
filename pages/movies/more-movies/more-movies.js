var app = getApp();
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    movies: {},
    navigateTitle: '',
    requestUrl: '',
    totalCount: 0,
    isEmpty: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var category = options.category;
    this.setData({
      navigateTitle: category
    });
    var dataUrl = '';
    var doubanUrl = app.globalData.doubanBase;
    switch (category) {
      case '正在热映':
        dataUrl = doubanUrl + '/v2/movie/in_theaters';
      case '即将上映':
        dataUrl = doubanUrl + '/v2/movie/coming_soon';
        break;
      case '豆瓣Top250':
        dataUrl = doubanUrl + '/v2/movie/top250';
        break;
    }
    this.setData({
      requestUrl: dataUrl
    })
    util.http(dataUrl, this.processDoubanData);
  },

  onScrollLower: function (event) {
    var nextUrl = this.data.requestUrl + '?start=' + this.data.totalCount + '&count=20';
    util.http(nextUrl, this.processDoubanData);
    wx.showNavigationBarLoading();
  },

  // 下拉刷新和 scroll-view 不可以同时使用，解决办法 https://zhuanlan.zhihu.com/p/24739728。
  // 然而经过测试，发现仍然存在问题。建议尽可能的不适用。
  // onPullDownRefresh: function (event) {
  //   var refreshUrl = this.data.requestUrl + '?star=0&count=20';
  //   this.data.movies = {};
  //   this.data.isEmpty = true;
  //   util.http(refreshUrl, this.processDoubanData);
  //   wx.showNavigationBarLoading();
  // },

  processDoubanData: function (moviesDouban) {
    var movies = [];
    for (var i in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[i];
      var title = subject.title;

      // 将过长的电影名以...代替
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }

      // 电影数组对象
      movies.push({
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id,
        stars: util.convertToStarsArray(subject.rating.stars)
      });
    }

    var totalMovies = {};
    // 如果要绑定新加载的数据，那么需要将同就有的数据合并在一起
    if (!this.data.isEmpty) {
      totalMovies = this.data.movies.concat(movies);
    } else {
      totalMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies
    });
    this.data.totalCount += 20;
    wx.hideNavigationBarLoading();
  },

  onReady: function (event) {
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle,
    })
  }
})