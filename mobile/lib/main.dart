import 'package:questly/app/bootstrap.dart';
import 'package:questly/config/environment.dart';

void main() async {
  await bootstrap(config: EnvironmentConfig.development);
}
