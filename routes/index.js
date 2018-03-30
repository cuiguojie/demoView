var express = require('express');
var router = express.Router();
var AV = require('leancloud-storage');
var APP_ID = '7N2h4Jr3r64QA5luNbTTPlUy-gzGzoHsz';
var APP_KEY = 'VIt0jMbATd1Azq8gTSi6tvKE';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

function getSlotByChannelId(channelId) {
  const slotQuery = new AV.Query('slot');

  slotQuery.equalTo('channel_id', channelId);

  return slotQuery.find();
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/channel/list/', function(req, res, next) {
  const channelQuery = new AV.Query('channel');

  channelQuery
    .include(['owner', 'type', 'range'])
    .find()
    .then((channels) => {
      var channelList = channels.map((channel) => {
        const { name, info, range, type, owner } = channel.attributes;

        return {
          id: channel.id,
          name,
          info,
          range: {
            value: range.attributes.value,
            name: range.attributes.name,
          },
          type: {
            value: type.attributes.value,
            name: type.attributes.name,
          },
          owner: {
            id: owner.id,
            name: owner.attributes.username,
          },
        };
      });

      res.send({
        ret: 0,
        channels: channelList,
        total: channels.length,
      });
    });
});

router.get('/api/channel/info/', function(req, res, next) {
  const channelId = req.query.id;
  const channelQuery = new AV.Query('channel');
  const stuffSpecQuery = new AV.Query('stuff_spec').include('type');
  const channelData = AV.Object.createWithoutData('channel', channelId);
  let channelInfo = {};

  channelQuery
    .include(['owner', 'type', 'range'])
    .get(channelId)
    .then((channel) => {
      const slotQuery = new AV.Query('slot').include('platform');

      channelInfo = channel.attributes;
      channelInfo.id = channelId;
      channelInfo.slots = [];

      return slotQuery
               .equalTo('channel', channelData)
               .find();
    })
    .then((slots) => {
      let count = 0;

      slots.forEach((item, index) => {
        const slotData = AV.Object.createWithoutData('slot', item.id);

        stuffSpecQuery
          .equalTo('slot', slotData)
          .find()
          .then((specs) => {
            const itemData = item.attributes;
            itemData.id = item.id;
            itemData.stuffSpecs = specs;

            channelInfo.slots[index] = (itemData);
            count = count + 1;

            if (count === slots.length) {
              res.send({
                ret: 0,
                channel: channelInfo,
              });
            }
          });
      })
    });
});

router.post('/api/channel/create', function(req, res, next) {
  const { name, range, type, info } = req.body;

  const Channel = new AV.Object('channel');

  let TypeOption = AV.Object.createWithoutData('option', type);
  let RangeOption = AV.Object.createWithoutData('option', range);
  let owner = AV.Object.createWithoutData('account', '5abcafbd9f54540038767ff8');

  Channel.set('name', name);
  Channel.set('info', info);
  Channel.set('type', TypeOption);
  Channel.set('range', RangeOption);
  Channel.set('owner', owner);

  Channel
    .save()
    .then((channel) => {
      res.send({
        ret: 0,
        id: channel.id,
      });
    })
});

router.post('/api/channel/save', function(req, res, next) {
  const { id, name, range, type, info } = req.body;

  const channel = AV.Object.createWithoutData('channel', id);

  let TypeOption = AV.Object.createWithoutData('option', type);
  let RangeOption = AV.Object.createWithoutData('option', range);
  let owner = AV.Object.createWithoutData('account', '5abcafbd9f54540038767ff8');

  channel.set('name', name);
  channel.set('info', info);
  channel.set('type', TypeOption);
  channel.set('range', RangeOption);
  channel.set('owner', owner);

  channel
    .save()
    .then((channel) => {
      res.send({
        ret: 0,
      });
    })
});

router.post('/api/channel/del/', function(req, res, next) {
  const id = req.body.id;

  const channel = AV.Object.createWithoutData('channel', id);

  channel
    .destroy()
    .then(
      (success) => {
        res.send({
          ret: 0,
        });
      },
      (error) => {
        res.send({
          ret: 1,
          message: error,
        });
      }
    )
});

// 宣发位创建
router.post('/api/slot/create', function(req, res, next) {
  const { channel: channelInfo, name, platform, cover, price, info, contact } = req.body;

  const slot = new AV.Object('slot');

  let channel = AV.Object.createWithoutData('channel', channelInfo.id);
  let platformOption = AV.Object.createWithoutData('option', platform);

  slot.set('channel', channel);
  slot.set('name', name);
  slot.set('info', info);
  slot.set('platform', platformOption);
  slot.set('cover', cover);
  slot.set('price', price);
  slot.set('contact_name', contact.name);
  slot.set('contact_phone', contact.phone);
  slot.set('contact_email', contact.email);
  slot.set('contact_qq', contact.qq);
  slot.set('contact_wechat', contact.wechat);

  slot
    .save()
    .then(() => {
      res.send({
        ret: 0,
      });
    })
});

// 宣发位删除
router.post('/api/slot/del/', function(req, res, next) {
  const id = req.body.id;
  const slot = AV.Object.createWithoutData('slot', id);

  slot
    .destroy()
    .then(
      (success) => {
        res.send({
          ret: 0,
        });
      },
      (error) => {
        res.send({
          ret: 1,
          message: error,
        });
      }
    )
});

router.post('/api/slot/save', function(req, res, next) {
  const { id, name, cover, price, info, contact_name, contact_phone, contact_wechat, contact_qq, contact_email, platform: platformId } = req.body;

  const slot = AV.Object.createWithoutData('slot', id);
  const platformOption = AV.Object.createWithoutData('option', platformId);

  slot.set('name', name);
  slot.set('cover', cover);
  slot.set('price', price);
  slot.set('info', info);
  slot.set('contact_name', contact_name);
  slot.set('contact_phone', contact_phone);
  slot.set('contact_wechat', contact_wechat);
  slot.set('contact_qq', contact_qq);
  slot.set('contact_email', contact_email);
  slot.set('platform', platformOption);

  slot
    .save()
    .then(() => {
      res.send({
        ret: 0,
      });
    })
});

// 宣发位信息
router.get('/api/slot/info/', function(req, res, next) {
  const slotId = req.query.id;
  const slotQuery = new AV.Query('slot').include('channel');
  const stuffSpecQuery = new AV.Query('stuff_spec').include('type');
  const slotData = AV.Object.createWithoutData('slot', slotId);
  let slotInfo = {};

  slotQuery
    .get(slotId)
    .then((slot) => {
      slotInfo = slot.attributes;
      slotInfo.id = slotId;
      
      return stuffSpecQuery
              .equalTo('slot', slotData)
              .find();      
    })
    .then((specs) => {
      slotInfo.stuffSpecs = specs;

      res.send({
        ret: 0,
        slot: slotInfo,
      })
    })
});

// 选项获取
router.get('/api/options', function(req, res, next) {
  const optionQuery = new AV.Query('option');

  optionQuery
    .find()
    .then((options) => {
      var data = options.map(( option ) => {
        return {
          type,
          name,
          value,
        } = option.attributes;
      });
      
      res.send({
        ret: 0,
        data,
      });
    });
});

// 物料规格创建
router.post('/api/stuffspec/create', function(req, res, next) {
  const { slotId, spec } = req.body;

  const stuffSpecObj = new AV.Object('stuff_spec');

  let slot = AV.Object.createWithoutData('slot', slotId);
  let typeOption = AV.Object.createWithoutData('option', spec.type.objectId);

  stuffSpecObj.set('slot', slot);
  stuffSpecObj.set('type', typeOption);
  stuffSpecObj.set('spec', spec.spec);
  stuffSpecObj.set('info', spec.info);

  stuffSpecObj
    .save()
    .then((stuffSpec) => {
      return new AV.Query('stuff_spec').include('type')
                   .get(stuffSpec.id);
    })
    .then((stuffSpec) => {
      res.send({
        ret: 0,
        stuffSpec,
      });
    })
});

// 物料规格创建
router.post('/api/stuffspec/del', function(req, res, next) {
  const id = req.body.id;

  let spec = AV.Object.createWithoutData('stuff_spec', id);

  spec
    .destroy()
    .then(
      (success) => {
        res.send({
          ret: 0,
        });
      },
      (error) => {
        res.send({
          ret: 1,
          message: error,
        });
      }
    )
});

// 物料规格编辑
router.post('/api/stuffspec/save', function(req, res, next) {
  const { objectId, type, spec, info } = req.body;

  const slot = AV.Object.createWithoutData('stuff_spec', objectId);
  const typeOption = AV.Object.createWithoutData('option', type.objectId);

  slot.set('spec', spec);
  slot.set('info', info);
  slot.set('type', typeOption);

  slot
    .save()
    .then(() => {
      res.send({
        ret: 0,
      });
    })
});
module.exports = router;
