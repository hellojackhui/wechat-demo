var postsData = require('../../../data/posts-data.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    collected: 0,
    isPlayingMusic: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var postId = options.id;
    this.setData({
      postData: postsData.postList[postId],
      postId: postId
    })
    var postsCollected = wx.getStorageSync('posts_Collected');
    if (postsCollected) {
    var postCollected = postsCollected[postId];
    this.setData({
      collected: postCollected
    })
    } else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_Collected', postsCollected);
    }
    if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicId === postId) {
      this.data.isPlayingMusic = true;
    }
      this.setMusicMonitor();
  },
  setMusicMonitor: function(event) {
    var that = this;
    wx.onBackgroundAudioPlay(function () {
      that.setData({
        isPlayingMusic: true
      })
      app.globalData.g_isPlayingMusic = true;
      app.globalData.g_currentMusicId = this.data.postId;
    });
    wx.onBackgroundAudioPause(function () {
      that.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
      app.globalData.g_currentMusicId = null;
    });
  },
  onCollectionTap: function(event) {
    var postsCollected = wx.getStorageSync('posts_Collected');
    var postCollected = postsCollected[this.data.postId];
    postCollected = !postCollected;
    postsCollected[this.data.postId] = postCollected;
    this.showToast(postsCollected, postCollected);
  },
  showToast: function (postsCollected, postCollected) {
    var that = this;
    wx.setStorageSync('posts_Collected', postsCollected);
    that.setData({
      collected: postCollected
    })
    wx.showToast({
      title: that.data.collected ? '收藏成功' : '取消收藏',
      duration: 1000,
      icon: 'success'
    })
  },
  showModal: function (postsCollected, postCollected) {
    var that = this;
    wx.showModal({
      title: '收藏',
      content: postCollected ?'收藏该文章' : '取消收藏该文章',
      showCancel: true,
      cancelText: '取消',
      cancelColor: 'grey',
      confirmText: '确认',
      confirmColor: '#405f80',
      success: function(res) {
        console.log(res);
        if (res.confirm) { 
          wx.setStorageSync('posts_Collected', postsCollected);
          that.setData({
            collected: postCollected
          })
        }
      }
    })
  },
  onSharetap: function(event) {
    wx.showActionSheet({
      itemList: [
        "分享到QQ空间",
        "分享到朋友圈",
        "分享到微博",
        "分享到微信好友"
      ],
      itemColor: '#405f80',
      success: function(res) {
        wx.showToast({
          title: res.tapIndex ? '分享成功' : '分享失败',
          duration: 1000,
          icon: 'success'
        })
      }
    })
  },
  onMusicTap: function(event) {
    var currentPostId = this.data.postId;
    var postData = postsData.postList[currentPostId];
    var isPlayingMusic = this.data.isPlayingMusic
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: !isPlayingMusic
      })
    } else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg
      });
      this.setData({
        isPlayingMusic: !isPlayingMusic
      })
    }
  }
})