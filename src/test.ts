import bcrypt from 'bcrypt';

const run = async () => {
  const passwords = [
    '123',
    'qwerty',
    'password',
    'superpassword',
    'anykibeniky',
    'belarus',
  ];

  for (const password of passwords) {
    const result = await bcrypt.compare(
      password,
      '$2a$10$Vn9PcYBKm2y0GeJK.Kzn6.0TKig9rHLd0ssxfijvKidM4OLwlr0jS',
    );

    if (result) {
      console.log('correct password: ', password);
    }
  }
};
run();
