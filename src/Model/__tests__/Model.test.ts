import { ObjectId } from 'mongodb';

import { getMongodb } from '../../../test-utils/TestUtils';
import { Model, AutoIncrementModel, register, parseIndex } from '../Model';
import * as hook from '../Hooks';

interface IUser {
  username: string;
  password: string;
}

interface IPost {
  title: string;
  content: string;
}

class User extends Model implements IUser {
  public static collectionName = 'users';

  public username: string;
  public password: string;
}

class Post extends AutoIncrementModel implements IPost {
  public static collectionName = 'posts';

  public title: string;
  public content: string;
}

class Something extends Model {
  public static collectionName = 'somethingElse';

  public test: boolean;
}

class SomethingWithAlreadySaved extends Model {
  public get alreadySaved() {
    return this.$alreadySaved;
  }
}

class SomethingWithAlreadySavedInt extends AutoIncrementModel {
  public get alreadySaved() {
    return this.$alreadySaved;
  }
}

class SomethingWithHooks extends Model {
  public testBeforeCreateHook: boolean;
  public testAfterCreateHook: boolean;
  public testBeforeUpdateHook: boolean;
  public testAfterUpdateHook: boolean;

  @hook.beforeCreate
  private async beforeCreate() {
    this.testBeforeCreateHook = true;
  }

  @hook.afterCreate
  private async afterCreate() {
    this.testAfterCreateHook = true;
  }

  @hook.beforeUpdate
  private async beforeUpdate() {
    this.testBeforeUpdateHook = true;
  }

  @hook.afterUpdate
  private async afterUpdate() {
    this.testAfterUpdateHook = true;
  }
}

class ASomethingWithHooks extends AutoIncrementModel {
  public testBeforeCreateHook: boolean;
  public testAfterCreateHook: boolean;
  public testBeforeUpdateHook: boolean;
  public testAfterUpdateHook: boolean;

  @hook.beforeCreate
  private async beforeCreate() {
    this.testBeforeCreateHook = true;
  }

  @hook.afterCreate
  private async afterCreate() {
    this.testAfterCreateHook = true;
  }

  @hook.beforeUpdate
  private async beforeUpdate() {
    this.testBeforeUpdateHook = true;
  }

  @hook.afterUpdate
  private async afterUpdate() {
    this.testAfterUpdateHook = true;
  }
}

let usernameCounter = 0;
function nextUsername() {
  return `root${++usernameCounter}`;
}

let postTitleCounter = 0;
function nextTitle() {
  return `post title ${++postTitleCounter}`;
}

const db = getMongodb();
Model.$setDatabase(db);

afterAll(async () => {
  await (await db.connection('mongo').database()).dropDatabase();
  await db.closeConnections();
});

test('can create', async () => {
  const newUser = await User.create({
    username: nextUsername(),
    password: 'root',
  });
  expect(newUser).toBeDefined();
});

test('get collection by model class', async () => {
  const collection = await User.getCollection();
  expect(collection).toBeDefined();
});

test('find one by property', async () => {
  const user = User.findOne({ username: 'root', password: 'root' });
  expect(user).toBeDefined();
});

test('find all', async () => {
  await User.create({
    username: nextUsername(),
    password: 'root',
  });

  const users = await User.find({});
  expect(await users.count()).toBe(2);
});

test('find by id should work', async () => {
  const user = await User.create({
    username: nextUsername(),
    password: 'root',
  });
  const secondUser = await User.findById(user.id);
  expect(secondUser).not.toBeNull();
});

test("find by id should throw when doesn't exists", async () => {
  const t = async () => {
    await User.findByIdOrThrow('notavalidid');
  };
  await expect(t).rejects.toStrictEqual(
    new Error('document notavalidid not found in users'),
  );
});

test('saved changes should be sent to database', async () => {
  const user = await User.create({
    username: nextUsername(),
    password: 'root',
  });
  user.password = 'rootroot';
  await user.save();

  const sameUser = await User.findById(user.id);
  expect(sameUser).not.toBeNull();
  expect((sameUser as User).password).toStrictEqual('rootroot');
});

test('id is an ObjectId', async () => {
  const user = await User.create({
    username: nextUsername(),
    password: 'root',
  });
  await user.save();

  expect(user.id).toBeInstanceOf(ObjectId);
});

test('delete on model', async () => {
  const user = await User.create({
    username: nextUsername(),
    password: 'root',
  });

  await user.delete();

  const sameUserButDeleted = await User.findById(user.id);
  expect(sameUserButDeleted).toBeNull();
});

test('id is a number on AutoIncrementModel', async () => {
  const firstPost = await Post.create({
    title: nextTitle(),
    content: 'post content',
  });
  expect(firstPost.id).toBe(1);
  expect(typeof firstPost.id).toBe('number');
});

test('AutoIncrementModel id increments', async () => {
  const firstPost = await Post.create({
    title: nextTitle(),
    content: 'post content',
  });
  const secondPost = await Post.create({
    title: nextTitle(),
    content: 'post content',
  });
  expect(firstPost.id).toBe(secondPost.id - 1);
});

test('passing session should run requests within the same session', async () => {
  const username = nextUsername();
  await db.connection('mongo').transaction(async (session) => {
    const user = await User.create(
      {
        username: username,
        password: 'rootroot',
      },
      { session },
    );

    user.password = 'root';

    await user.save();

    const shouldNotExist = await User.findOne({ username });
    expect(shouldNotExist).toBeNull();
  });

  const shouldExistNow = await User.findOne({ username });
  expect(shouldExistNow).not.toBeNull();
  expect(shouldExistNow?.password).toBe('root');
});

test('class instantiation Model should create an entry', async () => {
  const user = new User();
  user.username = nextUsername();
  user.password = 'rootroot';
  await user.save();

  const shouldExist = await User.findOne({ username: 'root8' });
  expect(shouldExist).not.toBeNull();
  expect(user.id).toBeInstanceOf(ObjectId);
});

test('class instantiation Model should be updatable', async () => {
  const username = nextUsername();
  const user = new User();
  user.username = username;
  user.password = 'rootroot';
  await user.save();

  user.password = 'root';
  await user.save();

  const shouldHaveNewPassword = await User.findOne({ username });
  expect(shouldHaveNewPassword?.password).toBe('root');
});

test('find one returns should not be dirty', async () => {
  const username = nextUsername();
  await User.create({
    username,
    password: 'rootroot',
  });

  const foundUser = await User.findOne({ username });
  expect(foundUser?.isDirty).toBe(false);
});

test('class instantiation auto incremented model', async () => {
  const post = new Post();
  post.title = nextTitle();
  post.content = 'post content';
  await post.save();

  expect(typeof post.id).toBe('number');
});

test('custom collection name - class', async () => {
  const something = await Something.create({ test: false });
  await something.save();
  expect((await Something.getCollection()).collectionName).toBe(
    Something.collectionName,
  );
});

test('custom collection name - instance', async () => {
  const something = new Something();
  something.test = true;
  await something.save();

  const found = await (
    await Model.$database.connection().collection(Something.collectionName)
  ).findOne({ _id: something.id });

  expect(found).not.toBeNull();
});

test('created user should not be dirty', async () => {
  const user = await User.create({
    username: nextUsername(),
    password: 'rootroot',
  });
  expect(user.isDirty).toBe(false);
});

test('merge method', async () => {
  const username = nextUsername();
  const myContent = {
    username,
    password: 'rootroot',
  };

  const user = new User();
  await user.merge(myContent).save();

  expect(user).toHaveProperty(['username']);
  expect(user.username).toBe(username);

  expect(user).toHaveProperty(['password']);
  expect(user.password).toBe('rootroot');
});

test('fill method', async () => {
  const user = new User();
  user.password = 'rootroot';

  await user.fill({ username: nextUsername() }).save();

  expect(user.password).toBeUndefined();
  expect(user.username).toBeDefined();
});

test('merge and fill accept no extra properties', async () => {
  const user = new User();

  user.merge({
    username: 'test',
    // @ts-expect-error
    bad: 'property',
  });

  const bad = {
    password: 'xxx',
    other: 'bad',
  };

  // @ts-expect-error
  user.merge(bad);

  user.fill({
    username: 'test',
    // @ts-expect-error
    bad: 'property',
  });

  // @ts-expect-error
  user.merge(bad);
});

test('fill method after save', async () => {
  const user = new User();
  user.password = 'rootroot';
  await user.save();
  const createdAt = user.createdAt;
  await user.fill({ username: nextUsername() }).save();

  expect(user.password).toBeUndefined();
  expect(user.username).toBeDefined();
  expect(user.createdAt).toBe(createdAt);
});

test('pass custom id', async () => {
  const username = nextUsername();
  const user = await User.create({
    _id: 'test',
    username,
    password: 'mypass',
  });

  await user.save();

  const newUser = await User.findOne({ username });
  expect(newUser?._id).toBe('test');
});

test('toJSON method', async () => {
  const post = await Post.create({
    _id: 'test',
    title: 'mytitle',
    content: 'mycontent',
  });

  const jsonPost = post.toJSON();

  const expected = {
    _id: 'test',
    title: 'mytitle',
    content: 'mycontent',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };

  expect(JSON.stringify(jsonPost)).toStrictEqual(JSON.stringify(expected));
});

test('alreadySaved', async () => {
  const item = new SomethingWithAlreadySaved();
  expect(item.alreadySaved).toBe(false);
  expect(await item.save()).toBe(true);
  expect(item.alreadySaved).toBe(true);

  const item2 = await SomethingWithAlreadySaved.findByIdOrThrow(item.id);
  expect(item2.alreadySaved).toBe(true);
});

test('alreadySaved AutoIncrementModel', async () => {
  const item = new SomethingWithAlreadySavedInt();
  expect(item.alreadySaved).toBe(false);
  expect(await item.save()).toBe(true);
  expect(item.alreadySaved).toBe(true);

  const item2 = await SomethingWithAlreadySavedInt.findByIdOrThrow(item.id);
  expect(item2.alreadySaved).toBe(true);
});

test('beforeCreate hook on create', async () => {
  const item = new SomethingWithHooks();
  expect(item.testBeforeCreateHook).toBeUndefined();
  await item.save();
  expect(item.testBeforeCreateHook).toBe(true);
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeCreateHook).toBe(true);
});

test('afterCreate hook on create', async () => {
  const item = new SomethingWithHooks();
  expect(item.testAfterCreateHook).toBeUndefined();
  await item.save();
  expect(item.testAfterCreateHook).toBe(true);
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterCreateHook).toBeUndefined();
});

test('beforeUpdate hook on create', async () => {
  const item = new SomethingWithHooks();
  expect(item.testBeforeUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testBeforeUpdateHook).toBeUndefined();
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeUpdateHook).toBeUndefined();
});

test('afterUpdate hook on create', async () => {
  const item = new SomethingWithHooks();
  expect(item.testAfterUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testAfterUpdateHook).toBeUndefined();
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterUpdateHook).toBeUndefined();
});

test('beforeCreate hook on update', async () => {
  const item = new SomethingWithHooks();
  await item.save();
  expect(item.testBeforeCreateHook).toBe(true);
  item.testBeforeCreateHook = false;
  await item.save();
  expect(item.testBeforeCreateHook).toBe(false);
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeCreateHook).toBe(false);
});

test('afterCreate hook on update', async () => {
  const item = new SomethingWithHooks();
  await item.save();
  expect(item.testAfterCreateHook).toBe(true);
  item.testAfterCreateHook = false;
  await item.save();
  expect(item.testAfterCreateHook).toBe(false);
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterCreateHook).toBe(false);
});

test('beforeUpdate hook on update', async () => {
  const item = new SomethingWithHooks();
  await item.save();
  expect(item.testBeforeUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testBeforeUpdateHook).toBe(true);
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeUpdateHook).toBe(true);
});

test('afterUpdate hook on update', async () => {
  const item = new SomethingWithHooks();
  await item.save();
  expect(item.testAfterUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testAfterUpdateHook).toBe(true);
  const newItem = await SomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterUpdateHook).toBeUndefined();
});

test('beforeCreate hook on create AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  expect(item.testBeforeCreateHook).toBeUndefined();
  await item.save();
  expect(item.testBeforeCreateHook).toBe(true);
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeCreateHook).toBe(true);
});

test('afterCreate hook on create AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  expect(item.testAfterCreateHook).toBeUndefined();
  await item.save();
  expect(item.testAfterCreateHook).toBe(true);
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterCreateHook).toBeUndefined();
});

test('beforeUpdate hook on create AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  expect(item.testBeforeUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testBeforeUpdateHook).toBeUndefined();
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeUpdateHook).toBeUndefined();
});

test('afterUpdate hook on create AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  expect(item.testAfterUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testAfterUpdateHook).toBeUndefined();
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterUpdateHook).toBeUndefined();
});

test('beforeCreate hook on update AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  await item.save();
  expect(item.testBeforeCreateHook).toBe(true);
  item.testBeforeCreateHook = false;
  await item.save();
  expect(item.testBeforeCreateHook).toBe(false);
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeCreateHook).toBe(false);
});

test('afterCreate hook on update AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  await item.save();
  expect(item.testAfterCreateHook).toBe(true);
  item.testAfterCreateHook = false;
  await item.save();
  expect(item.testAfterCreateHook).toBe(false);
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterCreateHook).toBe(false);
});

test('beforeUpdate hook on update AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  await item.save();
  expect(item.testBeforeUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testBeforeUpdateHook).toBe(true);
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testBeforeUpdateHook).toBe(true);
});

test('afterUpdate hook on update AutoIncModel', async () => {
  const item = new ASomethingWithHooks();
  await item.save();
  expect(item.testAfterUpdateHook).toBeUndefined();
  await item.save();
  expect(item.testAfterUpdateHook).toBe(true);
  const newItem = await ASomethingWithHooks.findById(item.id);
  expect(newItem?.testAfterUpdateHook).toBeUndefined();
});

test('parse index valid string', async () => {
  const indexes = ['+a', '-a', '#a', '@a', '+a,-b,#c,@d:unique', '#a:unique'];
  const expects = [
    { keys: { a: 1 }, opts: {} },
    { keys: { a: -1 }, opts: {} },
    { keys: { a: 'hashed' }, opts: {} },
    { keys: { a: 'text' }, opts: {} },
    { keys: { a: 1, b: -1, c: 'hashed', d: 'text' }, opts: { unique: true } },
    { keys: { a: 'hashed' }, opts: { unique: true } },
  ];

  for (let i in indexes) {
    const index = parseIndex(indexes[i]);
    expect(index).toEqual(expects[i]);
  }
});

test('parse index valid {}', async () => {
  const expects = [
    { keys: { a: 1 }, opts: {} },
    { keys: { a: -1 }, opts: {} },
    { keys: { a: 'hashed' }, opts: {} },
    { keys: { a: 'text' }, opts: {} },
    { keys: { a: 1, b: -1, c: 'hashed', d: 'text' }, opts: { unique: true } },
    { keys: { a: 'hashed' }, opts: { unique: true } },
  ];

  for (let index of expects) {
    const newIndex = parseIndex(index);
    expect(newIndex).toEqual(index);
  }
});

test('register models', async () => {
  @register
  class A extends Model {}
  @register
  class B extends A {}
  @register
  class C extends AutoIncrementModel {}

  expect(Model.$allModels).toEqual([A, B, C]);
});

test('Model.prepareIndexes', async () => {
  class IndexesModel1 extends AutoIncrementModel {
    public static $indexes = ['+order_+_unique:unique'];
  }

  class IndexesModel2 extends IndexesModel1 {
    public static $indexes = ['-order_-_unique:unique', '#a'];
  }

  const indexes1 = IndexesModel1.prepareIndexes(IndexesModel1);
  expect(indexes1).toEqual([
    { keys: { 'order_+_unique': 1 }, opts: { unique: true } },
  ]);

  const indexes2 = IndexesModel2.prepareIndexes(IndexesModel2);
  expect(indexes2).toEqual([
    { keys: { 'order_+_unique': 1 }, opts: { unique: true } },
    { keys: { 'order_-_unique': -1 }, opts: { unique: true } },
    { keys: { a: 'hashed' }, opts: {} },
  ]);
});
