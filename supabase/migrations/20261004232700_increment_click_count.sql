-- увеличение количества кликов у ссылки
create or replace function increment_click_count(link_id int8)
returns int8
language sql
as $$
  update links
  set click_count = click_count + 1
  where id = link_id
  returning click_count
$$;